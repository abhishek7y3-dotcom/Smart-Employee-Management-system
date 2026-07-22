import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: 'message' | 'announcement' | 'task' | 'system';
  referenceId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      default: null,
    },
    senderName: {
      type: String,
      default: 'System',
    },
    senderAvatar: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['message', 'announcement', 'task', 'system'],
      default: 'system',
    },
    referenceId: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for fetching unread notifications efficiently
notificationSchema.index({ recipientId: 1, isRead: 1 });

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
