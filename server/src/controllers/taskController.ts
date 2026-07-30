'use strict';

import { Request, Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/authMiddleware';


export async function getTasks(req: AuthRequest, res: Response) {
  // Authorization Check: Construct the database query based on the user's role.
  const query = req.user?.role === 'admin'
    ? { isArchived: { $ne: true } } // Admin sees everything not archived
    : { assignedTo: req.user?._id, isArchived: { $ne: true } }; // Member only sees their own unarchived tasks

  // Execute the query and join relational data
  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email role designation')
    .populate('assignedBy', 'name email role designation');

  // Data Integrity Check: Filter out tasks whose assignedTo user has been deleted (populate returns null)
  const validTasks = tasks.filter((t) => t.assignedTo !== null);

  return res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully.',
    data: { tasks: validTasks },
  });
}

/**
 * =========================================================================
 * INTERVIEW GUIDE: getTaskById (IDOR Protection)
 * Interviewer: "IDOR (Insecure Direct Object Reference) attack se kaise bachte hain?"
 * Aapka Jawab: "Agar koi employee URL me task ki ID change kar de (/api/tasks/123 -> /124), 
 * toh use dusre ka data na mile iske liye main database me sirf ID se search nahi karta.
 * Main query me 'assignedTo: req.user._id' bhi jodta hoon taaki wo sirf wahi task fetch kar 
 * sake jo usko assign hua ho."
 * =========================================================================
 */
export async function getTaskById(req: AuthRequest, res: Response) {
  // Construct a secure query to prevent IDOR attacks
  const query = req.user?.role === 'admin'
    ? { _id: req.params.id, isArchived: { $ne: true } }
    : { _id: req.params.id, assignedTo: req.user?._id, isArchived: { $ne: true } };

  const task = await Task.findOne(query)
    .populate('assignedTo', 'name email role')
    .populate('assignedBy', 'name email role');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found.',
      errors: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Task retrieved successfully.',
    data: { task },
  });
}

/**
 * @description Creates a new task and assigns it to an employee.
 * @logic
 * - Strictly enforces Role-Based Access Control (RBAC). Only admins can hit this endpoint.
 * - Extracts task data from the request body.
 * - Automatically sets the `assignedBy` field to the ID of the admin making the request to maintain an audit trail.
 */
import TaskAuditLog from '../models/TaskAuditLog';
import User from '../models/User';

export async function createTask(req: AuthRequest, res: Response) {
  // Role-Based Access Control (RBAC): Ensure only admins can create tasks
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Only administrators can assign tasks.',
      errors: [],
    });
  }

  // Extract payload from the incoming request body
  let { title, description, status, priority, dueDate, assignedTo } = req.body as {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    dueDate: string;
    assignedTo: string;
  };

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required.', errors: [] });
  }

  title = title.replace(/\s{2,}/g, ' ').trim();
  if (title.length < 5) return res.status(400).json({ success: false, message: 'Task title must contain at least 5 characters.', errors: [] });
  if (title.length > 120) return res.status(400).json({ success: false, message: 'Task title cannot exceed 120 characters.', errors: [] });

  if (/<[a-z][\s\S]*>/i.test(title) || /<[a-z][\s\S]*>/i.test(description)) {
    return res.status(400).json({ success: false, message: 'HTML or JavaScript code is not allowed.', errors: [] });
  }

  if (!description || !description.trim() || description.trim().length < 20) {
    return res.status(400).json({ success: false, message: 'Task description must contain at least 20 characters.', errors: [] });
  }

  const assignee = await User.findById(assignedTo);
  if (!assignee || !assignee.isVerified) {
    return res.status(400).json({ success: false, message: 'Cannot assign task. Employee is either invalid or unverified.', errors: [] });
  }

  // =========================================================================
  // INTERVIEW GUIDE: The Power of Promise.all (Parallel Execution)
  // Interviewer: "Aap database ko fast kaise rakhte hain jab 4 validation queries run karni hon?"
  // Aapka Jawab: "Agar main 4 await line-by-line likhunga, toh queries ek ke baad ek block 
  // hokar chalengi (Series). Iski jagah main 'Promise.all' use karta hoon. Ye chaaron 
  // queries ko MongoDB me ek sath (Parallel) bhejta hai. Isse hamara execution time 
  // 4 guna kam ho jata hai aur backend bahut fast respond karta hai."
  // =========================================================================
  const [duplicateTask, activeTasksCount, activeCriticalCount, overdueCount] = await Promise.all([
    Task.findOne({ title, assignedTo, status: { $in: ['todo', 'in_progress'] } }),
    Task.countDocuments({ assignedTo, status: { $in: ['todo', 'in_progress'] } }),
    Task.countDocuments({ assignedTo, priority: 'critical', status: { $in: ['todo', 'in_progress'] } }),
    Task.countDocuments({ assignedTo, status: 'overdue' })
  ]);

  if (duplicateTask) {
    return res.status(400).json({ success: false, message: 'An active task with the same title already exists for this employee.', errors: [] });
  }

  if (activeTasksCount >= 10) {
    return res.status(400).json({ success: false, message: 'This employee has reached the maximum active task limit.', errors: [] });
  }

  if (priority === 'critical' && activeCriticalCount >= 3) {
    return res.status(400).json({ success: false, message: 'Employee cannot have more than 3 active critical tasks.', errors: [] });
  }

  if (overdueCount >= 5) {
    return res.status(400).json({ success: false, message: 'Cannot assign task. Employee has 5 or more overdue tasks.', errors: [] });
  }

  const task = await Task.create({
    title,
    description: description.trim().replace(/\s{2,}/g, ' '),
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: new Date(dueDate),
    assignedTo,
    assignedBy: req.user?._id,
  });

  await TaskAuditLog.create({
    taskId: task._id,
    actionType: 'CREATE',
    changedBy: req.user?._id,
    previousValue: null,
    newValue: { title, priority, dueDate },
  });

  return res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: { task },
  });
}

/**
 * @description Updates an existing task (e.g., changing status to 'completed').
 * @logic
 * - Admins can update any task.
 * - Members can only update tasks assigned to them (enforced via the query object).
 * - Uses `findOneAndUpdate` with `{ new: true }` so MongoDB returns the updated document, not the old one.
 */
export async function updateTask(req: AuthRequest, res: Response) {
  const updates = req.body;

  // Construct secure query to ensure members can't update other people's tasks
  const query = req.user?.role === 'admin'
    ? { _id: req.params.id, isArchived: { $ne: true } }
    : { _id: req.params.id, assignedTo: req.user?._id, isArchived: { $ne: true } };

  // Apply updates to the database
  const task = await Task.findOneAndUpdate(
    query,
    updates,
    { new: true } // Return the modified document rather than the original
  )
    .populate('assignedTo', 'name email role')
    .populate('assignedBy', 'name email role');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found or not authorized.',
      errors: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: { task },
  });
}

/**
 * @description Deletes a task from the database.
 * @logic
 * - Currently, the logic allows both admins and members to delete tasks (members can only delete their own).
 * - Finds the document and permanently removes it.
 */
export async function deleteTask(req: AuthRequest, res: Response) {
  // Ensure the user actually has permission to delete this specific task
  const query = req.user?.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, assignedTo: req.user?._id };

  const task = await Task.findOneAndUpdate(query, { isArchived: true }, { new: true });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found or not authorized.',
      errors: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
    data: {},
  });
}

/**
 * @description Retrieves a list of archived tasks.
 * @logic
 * - Only admins can view the archive.
 */
export async function getArchivedTasks(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const tasks = await Task.find({ isArchived: true })
    .populate('assignedTo', 'name email role designation')
    .populate('assignedBy', 'name email role designation');

  const validTasks = tasks.filter((t) => t.assignedTo !== null);

  return res.status(200).json({
    success: true,
    message: 'Archived tasks retrieved successfully.',
    data: { tasks: validTasks },
  });
}

/**
 * @description Restores an archived task.
 * @logic
 * - Only admins can restore tasks.
 */
export async function restoreTask(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, isArchived: true },
    { isArchived: false },
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found in archive.' });
  }

  return res.status(200).json({
    success: true,
    message: 'Task restored successfully.',
    data: { task },
  });
}

export async function permanentDeleteTask(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  return res.status(200).json({ success: true, message: 'Task permanently deleted' });
}
