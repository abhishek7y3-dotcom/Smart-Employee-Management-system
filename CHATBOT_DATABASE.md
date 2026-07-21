# AI Employee Assistant - Database Schema Specifications

This document outlines the MongoDB schema definitions required to support the Chatbot module. The chatbot introduces two new collections to the existing database architecture: `ChatHistories` and `ConversationMemories`.

---

## 1. ChatHistory Collection

**Purpose**: To persistently store the metadata and high-level details of user conversation sessions. This acts as the "header" table for chats, allowing users to view a list of their past interactions in the sidebar.

**Collection Name**: `chat_histories`

### Schema Definition (Mongoose)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  summary?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true // Indexed for fast retrieval of a user's history
    },
    title: { 
      type: String, 
      required: true,
      default: 'New Conversation'
    },
    summary: { 
      type: String,
      required: false 
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
```

---

## 2. ConversationMemory Collection

**Purpose**: To store the actual individual messages (the dialogue) linked to a specific `ChatHistory`. This collection acts as the contextual memory window for the LLM. 

**Collection Name**: `conversation_memories`

### Design Considerations
Instead of storing messages as a massive array inside the `ChatHistory` document (which can hit MongoDB's 16MB document size limit), we store each message as its own document referenced back to the history ID.

### Schema Definition (Mongoose)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationMemory extends Document {
  chatHistoryId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: any[];     // Stores JSON representing tools Gemini requested
  toolResults?: any[];   // Stores JSON returned from our internal services
  tokensUsed?: number;   // Optional: For tracking API costs
  createdAt: Date;
}

const ConversationMemorySchema: Schema = new Schema(
  {
    chatHistoryId: { 
      type: Schema.Types.ObjectId, 
      ref: 'ChatHistory', 
      required: true,
      index: true // Crucial for fetching the message chain quickly
    },
    role: { 
      type: String, 
      enum: ['user', 'assistant', 'system', 'tool'], 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    toolCalls: {
      type: Schema.Types.Mixed, // Flexible array to store LLM function call payloads
      required: false
    },
    toolResults: {
      type: Schema.Types.Mixed, // Flexible array to store raw DB results returned to LLM
      required: false
    },
    tokensUsed: {
      type: Number,
      required: false
    }
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } // Messages are immutable once sent
  }
);

export default mongoose.model<IConversationMemory>('ConversationMemory', ConversationMemorySchema);
```

---

## 3. Database Interaction Flow

When a user sends a message, the following database operations occur in the `chatService`:

1. **Check for Existing Session**:
   - Does `conversationId` exist in the request? 
   - **No**: Create a new `ChatHistory` document. Generate a `title` (perhaps asynchronously using Gemini to summarize the first prompt).
   - **Yes**: Validate the `ChatHistory` belongs to the requesting `userId`.

2. **Save User Prompt**:
   - Insert the user's raw text into `ConversationMemory` with `role: 'user'`.

3. **Fetch Context Window**:
   - Run a `.find({ chatHistoryId: ID }).sort({ createdAt: -1 }).limit(10)` to grab the last 10 messages. 
   - Reverse the array to chronological order.
   - Feed this context to the Gemini LLM Orchestrator.

4. **Save AI Response**:
   - Once Gemini (and the associated Domain Tools) complete execution, insert the final generated markdown into `ConversationMemory` with `role: 'assistant'`.
   - Update the `updatedAt` timestamp on the parent `ChatHistory` document.

---

## 4. Maintenance & Archiving
To prevent the database from ballooning indefinitely:
- Implement a **TTL (Time-To-Live)** index on `ConversationMemory` if compliance allows deleting chat logs older than 90 days.
- Alternatively, run a background cron job to set `isArchived: true` on `ChatHistory` documents inactive for over 30 days to hide them from the primary UI fetches.
