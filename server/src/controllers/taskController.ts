'use strict';

import { Request, Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getTasks(req: AuthRequest, res: Response) {
  const tasks = await Task.find({ createdBy: req.user?._id })
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  return res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully.',
    data: { tasks },
  });
}

export async function getTaskById(req: AuthRequest, res: Response) {
  const task = await Task.findOne({ _id: req.params.id, createdBy: req.user?._id })
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

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
    createdBy: req.user?._id,
  });

  return res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: { task },
  });
}

export async function updateTask(req: AuthRequest, res: Response) {
  const updates = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user?._id },
    updates,
    { new: true }
  )
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

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
  const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user?._id });

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
