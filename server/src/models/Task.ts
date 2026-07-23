import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @description The Task Model represents the core entity of the Employee Task Manager.
 * It defines the structure, relationships, and validation rules for how tasks are stored in MongoDB.
 */
const taskSchema = new Schema<ITask>(
  {
    // Task ka naam ya title
    title: {
      type: String,
      required: true,
      trim: true, // Automatically removes whitespace from both ends of the string before saving
      maxlength: 150, // Security: Prevents extremely large strings from filling the database
    },
    // Task ki detail description
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    // Task ka current status, ye fix enum values me se ek hoga
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'overdue', 'cancelled'], // Enforces strict state management
      default: 'todo', // Automatically applied if not specified during creation
    },
    // Task ki priority ya urgency
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // Task kab tak complete karna hai (Deadline)
    dueDate: {
      type: Date,
      required: true, // A task must have a deadline
    },
    // Ye task kis employee ko assign kiya gaya hai (User Model se link hai)
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Relational Link: Tells Mongoose that this ObjectId points to a document in the 'User' collection
      required: true,
    },
    // Ye task kis admin ya project manager ne banaya hai
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Relational Link: Tracks the admin who created the task
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` Date fields
  }
);

// Add indexes for performance optimization
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 }); // Compound index for common queries

const Task = model<ITask>('Task', taskSchema);

export default Task;
