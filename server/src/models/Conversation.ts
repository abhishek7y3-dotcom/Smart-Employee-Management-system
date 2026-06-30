import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  type: 'direct' | 'announcement' | 'broadcast';
  subject: string;
  project?: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  participants: Types.Array<string>;
  participantNames: Types.Array<string>;
  participantAvatars: Types.Array<string>;
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender: string;
  unreadCount: number;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  hasAttachments: boolean;
  status: 'sent' | 'delivered' | 'read' | 'unread' | 'replied' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['direct', 'announcement', 'broadcast'],
      default: 'direct',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      default: '',
    },
    relatedTaskId: {
      type: String,
      default: '',
    },
    relatedTaskTitle: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    participants: [{
      type: String,
    }],
    participantNames: [{
      type: String,
    }],
    participantAvatars: [{
      type: String,
    }],
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    lastMessageSender: {
      type: String,
      default: '',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    hasAttachments: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'unread', 'replied', 'archived'],
      default: 'sent',
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;