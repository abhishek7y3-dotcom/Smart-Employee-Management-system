import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentChunk extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  text: string;
  embedding: number[];
  chunkIndex: number;
  createdAt: Date;
}

const DocumentChunkSchema: Schema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
      // NOTE: For MongoDB Atlas Vector Search, you generally do not define a traditional index on the embedding array here.
      // You create a specialized Atlas Vector Search Index on the collection via the Atlas UI or Atlas Search API.
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.DocumentChunk || mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
