import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationMemory extends Document {
  chatHistoryId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  tokensUsed?: number;
  createdAt: Date;
}

const ConversationMemorySchema: Schema = new Schema(
  {
    chatHistoryId: { 
      type: Schema.Types.ObjectId, 
      ref: 'ChatHistory', 
      required: true,
      index: true
    },
    role: { 
      type: String, 
      enum: ['user', 'assistant', 'system', 'tool'], 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    toolCalls: {
      type: Schema.Types.Mixed,
      required: false
    },
    toolResults: {
      type: Schema.Types.Mixed,
      required: false
    },
    tokensUsed: {
      type: Number,
      required: false
    }
  },
  { 
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.models.ConversationMemory || mongoose.model<IConversationMemory>('ConversationMemory', ConversationMemorySchema);