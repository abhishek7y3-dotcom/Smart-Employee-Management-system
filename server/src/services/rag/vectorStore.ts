import mongoose from 'mongoose';
import DocumentChunk from '../../models/DocumentChunk';

export const storeChunkEmbedding = async (
  documentId: string | mongoose.Types.ObjectId,
  text: string,
  embedding: number[],
  chunkIndex: number
) => {
  try {
    const chunk = await DocumentChunk.create({
      documentId,
      text,
      embedding,
      chunkIndex
    });
    return chunk;
  } catch (error) {
    console.error('Error storing chunk embedding:', error);
    throw new Error('Failed to store document chunk');
  }
};

export const vectorSearch = async (
  queryEmbedding: number[],
  documentId: string,
  limit: number = 5
) => {
  try {
    const results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit,
          filter: { documentId: new mongoose.Types.ObjectId(documentId) }
        }
      },
      {
        $project: {
          _id: 1,
          text: 1,
          chunkIndex: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ] as any[]);
    return results;
  } catch (error) {
    console.error('Error performing vector search:', error);
    throw new Error('Failed to perform vector search');
  }
};
