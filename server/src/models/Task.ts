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
    title: {
      type: String,
      required: true,
      trim: true, // Automatically removes whitespace from both ends of the string before saving
      maxlength: 150, // Security: Prevents extremely large strings from filling the database
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'overdue', 'cancelled'], // Enforces strict state management
      default: 'todo', // Automatically applied if not specified during creation
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      required: true, // A task must have a deadline
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Relational Link: Tells Mongoose that this ObjectId points to a document in the 'User' collection
      required: true,
    },
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
