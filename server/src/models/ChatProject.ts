import mongoose, { Document, Schema } from 'mongoose';

export interface IChatProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  chats: mongoose.Types.ObjectId[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatProjectSchema = new Schema<IChatProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    chats: [{ type: Schema.Types.ObjectId, ref: 'ChatHistory' }],
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatProjectSchema.index({ userId: 1, isArchived: 1 });

export default mongoose.model<IChatProject>('ChatProject', chatProjectSchema);
