import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import { AuthRequest } from '../middleware/authMiddleware';

const OFFICE_START_HOUR = 9; // 09:00 AM
const OFFICE_END_HOUR = 18; // 06:00 PM
const HALF_DAY_THRESHOLD = 4; // 4 hours
const STANDARD_HOURS = 8; // 8 hours (excluding 1 hour break)

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function checkIn(req: AuthRequest, res: Response) {
  try {
    const employeeId = req.user?._id;
    const dateStr = getTodayDateStr();
    const { workMode, location } = req.body;

    let record = await Attendance.findOne({ employeeId, attendanceDate: dateStr });
    if (record) {
      if (record.checkInTime) {
        return res.status(400).json({ success: false, message: 'Already checked in today.' });
      }
      // Update existing record (e.g. if created by admin as absent/leave earlier)
      record.checkInTime = new Date();
      record.workMode = workMode || 'Office';
      record.location = location;
      record.attendanceStatus = 'Present';
    } else {
      record = new Attendance({
        employeeId,
        employeeName: req.user?.name || `${req.user?.firstName} ${req.user?.lastName}`,
        department: (req.user as any)?.department || 'Unassigned',
        designation: (req.user as any)?.designation || 'Employee',
        attendanceDate: dateStr,
        checkInTime: new Date(),
        workMode: workMode || 'Office',
        location,
        attendanceStatus: 'Present'
      });
    }

    // Check if late
    const checkIn = new Date(record.checkInTime!);
    const expectedStart = new Date(checkIn);
    expectedStart.setHours(OFFICE_START_HOUR, 0, 0, 0);

    if (checkIn > expectedStart) {
      record.isLate = true;
      record.attendanceStatus = 'Late';
      record.lateByMinutes = Math.floor((checkIn.getTime() - expectedStart.getTime()) / 60000);
    }

    await record.save();
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function checkOut(req: AuthRequest, res: Response) {
  try {
    const employeeId = req.user?._id;
    const dateStr = getTodayDateStr();

    const record = await Attendance.findOne({ employeeId, attendanceDate: dateStr });
    if (!record || !record.checkInTime) {
      return res.status(400).json({ success: false, message: 'Not checked in today.' });
    }
    if (record.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out.' });
    }

    record.checkOutTime = new Date();

    // Check if early departure
    const expectedEnd = new Date(record.checkOutTime);
    expectedEnd.setHours(OFFICE_END_HOUR, 0, 0, 0);
    if (record.checkOutTime < expectedEnd) {
      record.leftEarly = true;
      record.earlyDepartureMinutes = Math.floor((expectedEnd.getTime() - record.checkOutTime.getTime()) / 60000);
    }

    // Calculate working hours
    let workMs = record.checkOutTime.getTime() - record.checkInTime.getTime();
    if (record.breakStart && record.breakEnd) {
      const breakMs = record.breakEnd.getTime() - record.breakStart.getTime();
      workMs -= breakMs;
      record.breakDuration = parseFloat((breakMs / 3600000).toFixed(2));
    }

    record.totalWorkingHours = parseFloat((workMs / 3600000).toFixed(2));

    if (record.totalWorkingHours < HALF_DAY_THRESHOLD) {
      record.attendanceStatus = 'Half Day';
    } else if (record.totalWorkingHours > STANDARD_HOURS) {
      record.overtimeHours = parseFloat((record.totalWorkingHours - STANDARD_HOURS).toFixed(2));
    }

    await record.save();
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    console.error('Check-out error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function markBreakStart(req: AuthRequest, res: Response) {
  try {
    const record = await Attendance.findOne({ employeeId: req.user?._id, attendanceDate: getTodayDateStr() });
    if (!record || !record.checkInTime || record.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Invalid attendance state.' });
    }
    if (record.breakStart) return res.status(400).json({ success: false, message: 'Break already started.' });

    record.breakStart = new Date();
    await record.save();
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function markBreakEnd(req: AuthRequest, res: Response) {
  try {
    const record = await Attendance.findOne({ employeeId: req.user?._id, attendanceDate: getTodayDateStr() });
    if (!record || !record.breakStart || record.breakEnd) {
      return res.status(400).json({ success: false, message: 'Invalid break state.' });
    }

    record.breakEnd = new Date();
    record.breakDuration = parseFloat(((record.breakEnd.getTime() - record.breakStart.getTime()) / 3600000).toFixed(2));

    await record.save();
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getAttendance(req: AuthRequest, res: Response) {
  try {
    const { year, month, date, department, status, search, workMode } = req.query;
    const userRole = req.user?.role as string;
    const isAdmin = userRole === 'admin' || userRole === 'Admin' || userRole === 'HR';

    const query: any = {};
    if (!isAdmin) {
      query.employeeId = req.user?._id;
    }

    if (date) query.attendanceDate = date;
    else if (year && month) {
      query.attendanceDate = { $regex: `^${year}-${String(month).padStart(2, '0')}` };
    }

    if (department && isAdmin) query.department = department;
    if (status) query.attendanceStatus = status;
    if (workMode) query.workMode = workMode;
    if (search && isAdmin) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await Attendance.find(query).sort({ attendanceDate: -1, checkInTime: -1 });
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateAttendance(req: AuthRequest, res: Response) {
  try {
    const userRole = req.user?.role as string;
    const isAdmin = userRole === 'admin' || userRole === 'Admin' || userRole === 'HR';
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Not found' });

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const dateStr = getTodayDateStr();

    const presentCount = await Attendance.countDocuments({ attendanceDate: dateStr, attendanceStatus: { $in: ['Present', 'Late'] } });
    const wfhCount = await Attendance.countDocuments({ attendanceDate: dateStr, workMode: 'Work From Home' });
    const lateCount = await Attendance.countDocuments({ attendanceDate: dateStr, isLate: true });

    const allToday = await Attendance.find({ attendanceDate: dateStr });
    let totalHrs = 0;
    let counted = 0;
    allToday.forEach(r => {
      if (r.totalWorkingHours) {
        totalHrs += r.totalWorkingHours;
        counted++;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        presentToday: presentCount,
        wfhToday: wfhCount,
        lateToday: lateCount,
        avgHours: counted ? parseFloat((totalHrs / counted).toFixed(2)) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
