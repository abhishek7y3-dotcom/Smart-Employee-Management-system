# AI Employee Assistant - Rules & Constraints

This document defines the strict engineering rules, coding standards, and AI safety guidelines that must be adhered to when developing or modifying the Chatbot module.

---

## 1. AI Safety & Prompting Rules

1. **Never Trust the Client**: The frontend must never pass the user's role or permissions to the backend for the AI to rely on. The backend `Orchestrator` MUST extract the user's role exclusively from the validated JWT token via `req.user`.
2. **Prevent Prompt Injection**: The LLM must not be allowed to bypass database schemas. Do not pass raw Mongoose models to the LLM. Only provide heavily restricted, predefined JSON tools (e.g., `fetchUserTasks(userId)`).
3. **No Direct Database Writes from LLM**: The LLM must NEVER output raw MongoDB queries (e.g., `db.collection.update(...)`). It must output structured JSON that maps to a backend Tool Wrapper, which then safely executes the pre-written Application Logic.
4. **Graceful Degradation**: If the Gemini API is down, rate-limited, or returns a 500 error, the backend must catch the exception and return a standardized user-friendly error message rather than crashing the Express server.

---

## 2. Architecture Rules

1. **DRY Business Logic**: The Chatbot module is a semantic layer, not a replacement for business logic. If the Chatbot needs to create a task, it must call the exact same `createTask` function/service used by the standard frontend UI. Do not duplicate logic inside `chatService.ts`.
2. **Stateless Requests**: Beyond the `ConversationMemory` fetched from MongoDB, the `POST /api/chat` endpoint must remain stateless. Do not store session variables in server memory.
3. **Tool Wrappers**: Every tool exposed to Gemini must reside in the `services/chatbot/` directory (e.g., `taskService.ts`) and must act strictly as a bridge between the Orchestrator and the Core Application Services.

---

## 3. Frontend Development Rules

1. **Component Modularity**: The `ChatWindow` must be broken down into atomic components (`ChatBubble`, `TypingIndicator`, `ChatInput`). Do not write monolithic 1000-line React components.
2. **Client-Side Context**: The chat state must be managed via `ChatContext.tsx`. Do not prop-drill the conversation array down multiple layers.
3. **Markdown Rendering**: All responses from the backend are assumed to be Markdown. Ensure the `MarkdownRenderer` component properly sanitizes the HTML to prevent XSS attacks before rendering it to the DOM.
4. **Loading States**: The UI must clearly indicate when the AI is "typing" or "thinking". Never leave the user wondering if the request went through.

---

## 4. Backend Coding Standards

1. **Type Safety**: All responses from Gemini and all Tool executions must be heavily typed using TypeScript interfaces defined in `types/chatbot.ts`.
2. **Token Limits**: Always cap the context window (e.g., fetch only the last 10 messages from `ConversationMemory`) to prevent excessive Gemini API billing and `Context Window Exceeded` errors.
3. **Rate Limiting**: The `chatRateLimiter.ts` middleware must be applied to all `/api/chat` routes without exception.
4. **Logging**: Do not log raw user prompts or full AI responses to the console in production environments, as they may contain sensitive PII (Personally Identifiable Information). Log only the `conversationId`, `intent` triggered, and execution time.
