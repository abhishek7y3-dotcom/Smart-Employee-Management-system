import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Leave from '../models/Leave';
import LeaveBalance from '../models/LeaveBalance';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendLeaveApprovalEmail, sendLeaveRejectionEmail } from '../utils/mailer';

export async function applyLeave(req: AuthRequest, res: Response) {
  try {
    const employeeId = req.user?._id;
    const { leaveType, startDate, endDate, totalDays, halfDay, halfDaySession, reason, attachment } = req.body;

    // Check for overlap
    const existingLeave = await Leave.findOne({
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (existingLeave) {
      return res.status(400).json({ success: false, message: 'You already have a leave request during this period.' });
    }

    // Optional: Check balance here before applying
    // We'll trust the frontend for now, or you can add a strict balance check here.

    const leave = new Leave({
      employeeId,
      employeeName: req.user?.name || req.user?.firstName + ' ' + req.user?.lastName,
      department: (req.user as any)?.department || 'Unassigned',
      designation: (req.user as any)?.designation || 'Employee',
      leaveType,
      startDate,
      endDate,
      totalDays,
      halfDay,
      halfDaySession,
      reason,
      attachment,
      status: 'Pending'
    });

    await leave.save();

    // Create notification for admins
    const admins = await User.find({ role: { $in: ['admin', 'Admin', 'HR'] } });
    const employeeName = req.user?.name || req.user?.firstName + ' ' + req.user?.lastName;
    const notifications = admins.map(admin => ({
      recipientId: admin._id,
      senderId: employeeId,
      senderName: employeeName,
      type: 'system',
      message: `New leave request from ${employeeName} for ${totalDays} day(s).`,
      isRead: false
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    console.error('Error applying leave:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getLeaves(req: AuthRequest, res: Response) {
  try {
    const { year, month, leaveType, status, search, department } = req.query;

    const query: any = {};

    // If employee, only show their own leaves
    const userRole = req.user?.role as string;
    if (userRole !== 'admin' && userRole !== 'Admin' && userRole !== 'HR' && userRole !== 'superadmin') {
      query.employeeId = req.user?._id;
    }

    if (department) query.department = department;
    if (leaveType) query.leaveType = leaveType;
    if (status) query.status = status;

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      query.startDate = { $gte: start, $lte: end };
    }

    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getLeaveById(req: AuthRequest, res: Response) {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    // Auth check
    const userRole = req.user?.role as string;
    if (leave.employeeId.toString() !== req.user?._id?.toString() && userRole !== 'admin' && userRole !== 'Admin' && userRole !== 'HR' && userRole !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    return res.status(200).json({ success: true, data: leave });
  } catch (error) {
    console.error('Error fetching leave:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    // Validate auth
    const userRole = req.user?.role as string;
    const isAdmin = userRole === 'admin' || userRole === 'Admin' || userRole === 'HR';
    if (!isAdmin && status !== 'Withdrawn' && status !== 'Cancelled') {
      return res.status(403).json({ success: false, message: 'Only admins can approve/reject leaves' });
    }

    if (!isAdmin && leave.employeeId.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    leave.status = status;
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    if (isAdmin) {
      leave.approverName = req.user?.name || req.user?.firstName + ' ' + req.user?.lastName;
      leave.approvedDate = new Date();
    }

    // Update balances if Approved
    if (status === 'Approved') {
      let balance = await LeaveBalance.findOne({ employeeId: leave.employeeId, year: new Date().getFullYear() });
      if (!balance) {
        // Create default balance if none exists
        balance = new LeaveBalance({
          employeeId: leave.employeeId,
          year: new Date().getFullYear(),
          balances: [
            { leaveType: 'Sick Leave', total: 10, used: 0, remaining: 10 },
            { leaveType: 'Casual Leave', total: 10, used: 0, remaining: 10 },
            { leaveType: 'Earned Leave', total: 15, used: 0, remaining: 15 },
            { leaveType: leave.leaveType, total: 10, used: 0, remaining: 10 } // Ensure type exists
          ]
        });
      }

      const typeBalance = balance.balances.find((b: any) => b.leaveType === leave.leaveType);
      if (typeBalance) {
        leave.leaveBalanceBefore = typeBalance.remaining;
        typeBalance.used += leave.totalDays;
        typeBalance.remaining = typeBalance.total - typeBalance.used;
        leave.leaveBalanceAfter = typeBalance.remaining;
      } else {
        // Type didn't exist in balance, add it dynamically
        balance.balances.push({
          leaveType: leave.leaveType,
          total: 10, // Default fallback
          used: leave.totalDays,
          remaining: 10 - leave.totalDays
        });
        leave.leaveBalanceBefore = 10;
        leave.leaveBalanceAfter = 10 - leave.totalDays;
      }
      await balance.save();
    }

    await leave.save();

    // Send email notification if approved
    if (status === 'Approved') {
      const employee = await User.findById(leave.employeeId);
      if (employee && employee.email) {
        const approverName = leave.approverName || 'an Administrator';
        const formattedStart = new Date(leave.startDate).toLocaleDateString();
        const formattedEnd = new Date(leave.endDate).toLocaleDateString();

        sendLeaveApprovalEmail(
          employee.email,
          leave.employeeName,
          approverName,
          leave.leaveType,
          formattedStart,
          formattedEnd,
          leave.totalDays
        ).catch((err) => {
          console.error('Failed to send leave approval email:', err);
        });
      }
    } else if (status === 'Rejected') {
      const employee = await User.findById(leave.employeeId);
      if (employee && employee.email) {
        const approverName = leave.approverName || 'an Administrator';
        const formattedStart = new Date(leave.startDate).toLocaleDateString();
        const formattedEnd = new Date(leave.endDate).toLocaleDateString();

        sendLeaveRejectionEmail(
          employee.email,
          leave.employeeName,
          approverName,
          leave.leaveType,
          formattedStart,
          formattedEnd,
          leave.totalDays,
          leave.rejectionReason || 'No specific reason provided.'
        ).catch((err) => {
          console.error('Failed to send leave rejection email:', err);
        });
      }
    }

    // Send in-app notification to employee
    if (status === 'Approved' || status === 'Rejected') {
      const approverName = req.user?.name || req.user?.firstName + ' ' + req.user?.lastName;
      await Notification.create({
        recipientId: leave.employeeId,
        senderId: req.user?._id,
        senderName: approverName,
        type: 'system',
        message: `Your leave request for ${leave.totalDays} day(s) has been ${status.toLowerCase()} by ${approverName}.`,
        isRead: false
      });
    }

    return res.status(200).json({ success: true, data: leave });
  } catch (error) {
    console.error('Error updating leave status:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function deleteLeave(req: AuthRequest, res: Response) {
  try {
    const userRole = req.user?.role as string;
    const isAdmin = userRole === 'admin' || userRole === 'Admin' || userRole === 'HR';
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    return res.status(200).json({ success: true, message: 'Leave deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getLeaveBalance(req: AuthRequest, res: Response) {
  try {
    const employeeId = req.query.employeeId || req.user?._id;
    const year = req.query.year || new Date().getFullYear();

    let balance = await LeaveBalance.findOne({ employeeId, year });
    if (!balance) {
      // Default setup
      balance = new LeaveBalance({
        employeeId,
        year,
        balances: [
          { leaveType: 'Sick Leave', total: 10, used: 0, remaining: 10 },
          { leaveType: 'Casual Leave', total: 10, used: 0, remaining: 10 },
          { leaveType: 'Earned Leave', total: 15, used: 0, remaining: 15 }
        ]
      });
      await balance.save();
    }

    return res.status(200).json({ success: true, data: balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getLeaveStats(req: AuthRequest, res: Response) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const onLeaveToday = await Leave.countDocuments({
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const pendingRequests = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

    return res.status(200).json({
      success: true,
      data: {
        onLeaveToday,
        pendingRequests,
        approvedLeaves,
        rejectedLeaves
      }
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
