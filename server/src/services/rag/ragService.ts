import { extractTextFromPdf } from './pdfExtractor';
import { chunkText } from './chunkingService';
import { generateEmbedding } from './embeddingService';
import { storeChunkEmbedding, vectorSearch } from './vectorStore';
import { sendPromptWithTools } from '../chatbot/geminiService';
import Document from '../../models/Document';

export const processDocument = async (fileBuffer: Buffer, documentId: string) => {
  try {
    // 1. Extract text from PDF
    const text = await extractTextFromPdf(fileBuffer);
    
    // 2. Chunk text
    const chunks = chunkText(text);

    // 3. Generate embeddings and store in Vector DB
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);
      await storeChunkEmbedding(documentId, chunk, embedding, i);
    }

    // 4. Update status to completed
    await Document.findByIdAndUpdate(documentId, { status: 'completed' });
    return true;
  } catch (error) {
    console.error('Error processing document for RAG:', error);
    await Document.findByIdAndUpdate(documentId, { status: 'failed' });
    throw error;
  }
};

export const askQuestion = async (question: string, documentId: string) => {
  // 1. Embed user question
  const queryEmbedding = await generateEmbedding(question);

  // 2. Search for relevant chunks
  const topChunks = await vectorSearch(queryEmbedding, documentId, 5);
  
  if (!topChunks || topChunks.length === 0) {
    return "I couldn't find any relevant information in the document to answer your question.";
  }

  // 3. Build context from top chunks
  const context = topChunks.map((chunk: any) => chunk.text).join('\n\n---\n\n');

  // 4. Construct prompt and call LLM (Gemini)
  const systemPrompt = `You are an intelligent document assistant. Below is context extracted from the user's uploaded document. Answer the user's question based strictly on the context provided. Do not use outside knowledge. If the answer is not in the context, clearly state that you don't know based on the document.\n\nContext:\n${context}`;
  
  const response = await sendPromptWithTools(systemPrompt, [], question, []);
  
  // Handling the possibility of functionCalls or raw text from geminiService
  let finalAnswer = '';
  try {
    finalAnswer = response.text();
  } catch (e) {
    finalAnswer = "Unable to extract a textual answer from the model.";
  }

  return finalAnswer;
};
