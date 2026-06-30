import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'unread' | 'replied' | 'archived';
  attachments: {
    id: string;
    name: string;
    type: 'image' | 'pdf' | 'docx' | 'excel' | 'zip' | 'other';
    url: string;
    size: number;
  }[];
  mentions: string[];
  isEdited: boolean;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderAvatar: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'unread', 'replied', 'archived'],
      default: 'sent',
    },
    attachments: [{
      id: String,
      name: String,
      type: {
        type: String,
        enum: ['image', 'pdf', 'docx', 'excel', 'zip', 'other'],
        default: 'other',
      },
      url: String,
      size: Number,
    }],
    mentions: [{
      type: String,
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
    replyToId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Message = model<IMessage>('Message', messageSchema);

export default Message;