import { Schema, model, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  publishDate: Date;
  expiryDate?: Date;
  isPinned: boolean;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    readBy: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

const Announcement = model<IAnnouncement>('Announcement', announcementSchema);

export default Announcement;