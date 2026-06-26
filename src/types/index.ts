export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  designation?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ActivityAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  taskTitle: string;
  employeeName: string;
  action: ActivityAction;
  createdAt: string;
  details?: string;
}
