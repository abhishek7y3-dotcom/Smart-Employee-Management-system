import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import Task from '../../models/Task';
import User, { IUser } from '../../models/User';
import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// 1. FETCH TASKS
// ---------------------------------------------------------------------------
export const fetchTasksDeclaration: FunctionDeclaration = {
  name: 'fetchTasks',
  description: 'Fetches a list of tasks assigned to users. Can filter by status and priority.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      status: {
        type: SchemaType.STRING,
        description: 'Optional. Filter by status: todo, in_progress, completed, overdue, cancelled',
      },
      priority: {
        type: SchemaType.STRING,
        description: 'Optional. Filter by priority: low, medium, high',
      }
    },
  },
};

export async function handleFetchTasks(user: IUser, args: { status?: string; priority?: string }) {
  const query: any = {};
  if (user.role !== 'admin') {
    query.assignedTo = user._id;
  }
  if (args.status) query.status = args.status;
  if (args.priority) query.priority = args.priority;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email role')
    .limit(10)
    .lean();

  return tasks.map((t: any) => ({
    id: t._id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    assignedTo: t.assignedTo?.name || 'Unknown'
  }));
}

// ---------------------------------------------------------------------------
// 2. CREATE TASK
// ---------------------------------------------------------------------------
export const createTaskDeclaration: FunctionDeclaration = {
  name: 'createTask',
  description: 'Creates a new task and assigns it to a user. ADMIN ONLY.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: 'Title of the task' },
      description: { type: SchemaType.STRING, description: 'Detailed description of the task' },
      assigneeName: { type: SchemaType.STRING, description: 'First or full name of the employee to assign this to' },
      priority: { type: SchemaType.STRING, description: 'low, medium, high' },
      dueDateDays: { type: SchemaType.NUMBER, description: 'Number of days from now the task is due' }
    },
    required: ['title', 'description', 'assigneeName']
  },
};

export async function handleCreateTask(user: IUser, args: { title: string; description: string; assigneeName: string; priority?: string; dueDateDays?: number }) {
  if (user.role !== 'admin') {
    return { error: 'UNAUTHORIZED: Only administrators can create tasks.' };
  }

  // Find the assignee
  const assignee = await User.findOne({ name: { $regex: new RegExp(args.assigneeName, 'i') } });
  if (!assignee) {
    return { error: `Assignee '${args.assigneeName}' not found in the database. Please ask the user to clarify.` };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (args.dueDateDays || 7));

  const task = await Task.create({
    title: args.title,
    description: args.description,
    status: 'todo',
    priority: args.priority || 'medium',
    dueDate,
    assignedTo: assignee._id,
    assignedBy: user._id,
  });

  return { success: true, message: `Task '${task.title}' created and assigned to ${assignee.name}.` };
}

// ---------------------------------------------------------------------------
// 3. UPDATE TASK STATUS
// ---------------------------------------------------------------------------
export const updateTaskStatusDeclaration: FunctionDeclaration = {
  name: 'updateTaskStatus',
  description: 'Updates the status of an existing task.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      taskId: { type: SchemaType.STRING, description: 'The MongoDB ObjectId of the task' },
      newStatus: { type: SchemaType.STRING, description: 'todo, in_progress, completed, overdue, cancelled' }
    },
    required: ['taskId', 'newStatus']
  },
};

export async function handleUpdateTaskStatus(user: IUser, args: { taskId: string; newStatus: string }) {
  if (!mongoose.Types.ObjectId.isValid(args.taskId)) {
    return { error: 'Invalid task ID format.' };
  }

  const query: any = { _id: args.taskId };
  if (user.role !== 'admin') {
    query.assignedTo = user._id; // Members can only update their own tasks
  }

  const task = await Task.findOneAndUpdate(query, { status: args.newStatus }, { new: true });
  if (!task) {
    return { error: 'Task not found or you do not have permission to update it.' };
  }

  return { success: true, message: `Task '${task.title}' status updated to ${task.status}.` };
}
