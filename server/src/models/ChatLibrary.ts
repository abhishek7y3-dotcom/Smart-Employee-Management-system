import mongoose, { Document, Schema } from 'mongoose';

export interface IChatLibrary extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  chats: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatLibrarySchema = new Schema<IChatLibrary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    chats: [{ type: Schema.Types.ObjectId, ref: 'ChatHistory' }],
  },
  { timestamps: true }
);

export default mongoose.model<IChatLibrary>('ChatLibrary', chatLibrarySchema);
