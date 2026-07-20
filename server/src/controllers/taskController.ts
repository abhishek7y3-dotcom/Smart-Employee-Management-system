'use strict';

import { Request, Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getTasks(req: AuthRequest, res: Response) {
  const query = req.user?.role === 'admin'
    ? {}
    : { assignedTo: req.user?._id };

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email role designation')
    .populate('assignedBy', 'name email role designation');

  // Filter out tasks whose assignedTo user has been deleted (populate returns null)
  const validTasks = tasks.filter((t) => t.assignedTo !== null);

  return res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully.',
    data: { tasks: validTasks },
  });
}

export async function getTaskById(req: AuthRequest, res: Response) {
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

export async function createTask(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Only administrators can assign tasks.',
      errors: [],
    });
  }

  const { title, description, status, priority, dueDate, assignedTo } = req.body as {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    dueDate: string;
    assignedTo: string;
  };

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

export async function updateTask(req: AuthRequest, res: Response) {
  const updates = req.body;
  const query = req.user?.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, assignedTo: req.user?._id };

  const task = await Task.findOneAndUpdate(
    query,
    updates,
    { new: true }
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

export async function deleteTask(req: AuthRequest, res: Response) {
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
