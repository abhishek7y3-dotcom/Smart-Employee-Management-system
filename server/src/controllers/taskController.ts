'use strict';

import { Request, Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @description Retrieves a list of tasks.
 * @logic
 * - If the user is an 'admin', they bypass the filter and retrieve ALL tasks in the system.
 * - If the user is a 'member', the query is strictly limited to tasks where `assignedTo` matches their own User ID.
 * - Uses Mongoose `.populate()` to join the 'User' collection and fetch the name, email, and role of the assigner/assignee.
 * - Filters out any corrupted tasks where the assigned user was deleted from the database.
 */
export async function getTasks(req: AuthRequest, res: Response) {
  // Authorization Check: Construct the database query based on the user's role.
  const query = req.user?.role === 'admin'
    ? {} // Admin sees everything
    : { assignedTo: req.user?._id }; // Member only sees their own tasks

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
 * @description Retrieves a single task by its database ID.
 * @logic
 * - Secures the lookup by injecting the user's ID into the query if they are a regular member.
 * - This prevents "Insecure Direct Object Reference (IDOR)" attacks where a user tries to guess another user's task ID.
 */
export async function getTaskById(req: AuthRequest, res: Response) {
  // Construct a secure query to prevent IDOR attacks
  const query = req.user?.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, assignedTo: req.user?._id };

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
export async function createTask(req: AuthRequest, res: Response) {
  // Role-Based Access Control (RBAC): Ensure only admins can create tasks
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Only administrators can assign tasks.',
      errors: [],
    });
  }

  // Extract payload from the incoming request body
  const { title, description, status, priority, dueDate, assignedTo } = req.body as {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    dueDate: string;
    assignedTo: string;
  };

  // Create the task in MongoDB. 
  // Notice how `assignedBy` is automatically populated from the verified token, preventing forgery.
  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: new Date(dueDate),
    assignedTo,
    assignedBy: req.user?._id,
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
    ? { _id: req.params.id }
    : { _id: req.params.id, assignedTo: req.user?._id };

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

  const task = await Task.findOneAndDelete(query);

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
