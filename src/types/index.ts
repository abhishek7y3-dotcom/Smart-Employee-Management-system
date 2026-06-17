export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // Employee ID
  dueDate: string; // ISO Date string
  createdAt: string; // ISO Date string
}
