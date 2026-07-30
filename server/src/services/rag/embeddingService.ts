import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// customFetch to ensure API key is strictly in URL (matching geminiService.ts pattern)
const customFetch = async (url: string | URL | Request, init?: RequestInit) => {
  const urlObj = new URL(url.toString());
  urlObj.searchParams.set('key', process.env.GEMINI_API_KEY || '');
  
  const headers = new Headers(init?.headers);
  headers.delete('Authorization');
  
  return fetch(urlObj.toString(), {
    ...init,
    headers
  });
};

const embeddingModel = genAI.getGenerativeModel(
  { model: 'gemini-embedding-2' },
  { customFetch } as any
);

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate text embedding');
  }
};
