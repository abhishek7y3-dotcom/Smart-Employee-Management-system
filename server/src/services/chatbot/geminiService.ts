import { GoogleGenerativeAI, FunctionDeclaration } from '@google/generative-ai';

// Initialize the SDK. It will throw if the key is missing when called, 
// which is handled gracefully in the orchestrator.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// We use a custom fetch interceptor because the Gemini SDK incorrectly 
// classifies new 'AQ.' API keys as OAuth tokens and puts them in the 
// Authorization header instead of the URL query string.
const customFetch = async (url: string | URL | Request, init?: RequestInit) => {
  const urlObj = new URL(url.toString());
  // Force the API key back into the query string
  urlObj.searchParams.set('key', process.env.GEMINI_API_KEY || '');
  
  // Create new headers and remove the invalid Bearer token
  const headers = new Headers(init?.headers);
  headers.delete('Authorization');
  
  return fetch(urlObj.toString(), {
    ...init,
    headers
  });
};

// We use the modern gemini-flash-latest model which supports function calling
const model = genAI.getGenerativeModel(
  { model: 'gemini-flash-latest' },
  { customFetch }
);

export async function sendPromptWithTools(
  systemInstruction: string,
  history: any[],
  prompt: string | any[],
  tools: { functionDeclarations: FunctionDeclaration[] }[]
) {
  const modelConfig: any = {
    model: 'gemini-flash-latest',
    systemInstruction,
  };

  if (tools && tools.length > 0) {
    modelConfig.tools = tools;
  }

  const modelWithConfig = genAI.getGenerativeModel(
    modelConfig,
    { customFetch }
  );

  const chat = modelWithConfig.startChat({
    history,
  });

  const result = await chat.sendMessage(prompt);
  const response = result.response;
  
  return response;
}
