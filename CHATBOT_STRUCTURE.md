# AI Employee Assistant - Chatbot Structure

This document serves as the official reference for the folder structure, file organization, and responsibilities of the AI Employee Assistant (Chatbot) module within the Employee Task Manager.

---

## 1. Frontend Structure (`/src`)

The frontend chatbot module integrates seamlessly into the Next.js App Router and utilizes modular React components.

```text
src/
├── app/
│   └── chatbot/
│       ├── page.tsx               # Main entry point for the Chat UI
│       └── loading.tsx            # Suspense fallback for the Chat UI
│
├── components/
│   └── chatbot/
│       ├── ChatWindow.tsx         # Main container holding messages and input
│       ├── ChatHeader.tsx         # Top bar (Bot status, clear chat button)
│       ├── ChatSidebar.tsx        # Optional sidebar for conversation history
│       ├── ChatInput.tsx          # Textarea for user queries
│       ├── ChatMessage.tsx        # Wrapper for individual messages
│       ├── ChatBubble.tsx         # Visual bubble (User vs AI styling)
│       ├── MessageActions.tsx     # Copy, Regenerate, Thumbs up/down
│       ├── TypingIndicator.tsx    # Animated loading dots
│       ├── SuggestedPrompts.tsx   # Chips for quick queries
│       ├── EmptyState.tsx         # Initial greeting when no messages exist
│       ├── MarkdownRenderer.tsx   # Parses and renders Gemini markdown output
│       └── ChatHistory.tsx        # Drawer/List of past conversations
│
├── services/
│   └── chatbot/
│       ├── chatApi.ts             # Axios calls to POST /api/chat
│       ├── chatHistoryApi.ts      # Fetching/Deleting previous sessions
│       └── conversationApi.ts     # Managing conversation IDs
│
├── hooks/
│   └── chatbot/
│       ├── useChat.ts             # Custom hook for sending/receiving messages
│       ├── useConversation.ts     # Hook for managing conversation sessions
│       └── useTyping.ts           # Hook for simulating typing delays
│
├── context/
│   └── ChatContext.tsx            # React Context for global chat state
│
├── types/
│   └── chatbot.ts                 # TypeScript interfaces (Message, ChatHistory)
│
└── utils/
    └── chatbot/
        ├── markdown.ts            # Utility for parsing specific markdown patterns
        ├── formatter.ts           # Date/Time formatters for messages
        └── suggestions.ts         # Logic for dynamic prompt suggestions
```

---

## 2. Backend Structure (`/server/src`)

The backend follows the Controller-Service architecture, utilizing Gemini Function Calling (Orchestrator) to route intents to existing domain services.

```text
server/src/
├── controllers/
│   └── chatController.ts          # Express endpoint handler (POST /api/chat)
│
├── routes/
│   └── chatRoutes.ts              # Express router for /api/chat endpoints
│
├── middleware/
│   └── chatRateLimiter.ts         # Prevents API abuse and token exhaustion
│
├── services/
│   └── chatbot/
│       ├── chatService.ts             # Main entry orchestration
│       ├── intentService.ts           # Natural language intent detection
│       ├── decisionEngine.ts          # Decides to use RAG, DB Tools, or standard chat
│       ├── geminiService.ts           # SDK wrapper for Google Gemini API
│       ├── promptService.ts           # System prompt injection and management
│       ├── conversationService.ts     # Context retrieval for memory
│       ├── recommendationService.ts   # Proactive AI suggestions
│       ├── taskService.ts             # Tool wrapper calling core Task logic
│       ├── employeeService.ts         # Tool wrapper calling core Employee logic
│       ├── dashboardService.ts        # Tool wrapper calling core Dashboard logic
│       ├── communicationService.ts    # Tool wrapper calling core Comm logic
│       └── reportService.ts           # Tool wrapper for aggregating data
│
├── models/
│   ├── ChatHistory.ts             # Mongoose schema for saved user chats
│   └── ConversationMemory.ts      # Temporary context window storage
│
├── validators/
│   └── chatValidator.ts           # Express-validator schemas for chat payloads
│
├── constants/
│   ├── intents.ts                 # Enum definitions of supported intents
│   └── prompts.ts                 # Base AI system instructions
│
├── types/
│   └── chatbot.ts                 # Interfaces for LLM payloads and tools
│
└── utils/
    └── chatbot/
        ├── tokenizer.ts           # Token counting utilities
        ├── parser.ts              # Extracts structured JSON from LLM text
        └── responseFormatter.ts   # Standardizes output to the frontend
```

---

## 3. Database Collections

The Chatbot module introduces two new collections to the MongoDB database:
1. **ChatHistory**: Stores persistent logs of conversations between users and the AI (Useful for auditing and returning users).
2. **ConversationMemory**: Optimized collection for fast retrieval of the *current* active context window (last N messages).

---

## 4. API Endpoints

- **`POST /api/chat`**: Main bidirectional communication endpoint. (Future state: `POST /api/chat/stream` for SSE).
- **`GET /api/chat/history`**: Retrieves all previous chat sessions for a specific user.
- **`DELETE /api/chat/history/:id`**: Clears a specific conversation thread.

*Note: All endpoints are protected by the existing `verifyToken` JWT middleware.*
