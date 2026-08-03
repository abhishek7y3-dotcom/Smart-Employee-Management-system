import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  dateStr: string;
  content: string;
}

const NoteSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateStr: { type: String, required: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index to speed up queries, but not unique anymore
NoteSchema.index({ userId: 1, dateStr: 1 });

export default mongoose.model<INote>('Note', NoteSchema);
