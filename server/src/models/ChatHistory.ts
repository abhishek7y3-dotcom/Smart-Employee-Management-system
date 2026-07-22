import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  summary?: string;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    title: { 
      type: String, 
      required: true,
      default: 'New Conversation'
    },
    summary: { 
      type: String,
      required: false 
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

// Add compound index for fetching chat history (sorted by updatedAt)
ChatHistorySchema.index({ userId: 1, isArchived: 1, updatedAt: -1 });

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);