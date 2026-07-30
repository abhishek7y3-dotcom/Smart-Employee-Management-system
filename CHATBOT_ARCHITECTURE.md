# AI Employee Assistant - Architectural Design

This document details the architectural flow, component interactions, and data lifecycle of the Chatbot module integrated into the Employee Task Manager.

---

## 1. High-Level Architecture

The chatbot follows a hybrid **Retrieval-Augmented Generation (RAG) & Tool-Calling** architecture. It acts as an intelligent router sitting between the User Interface and the core business logic of the application.

```mermaid
graph TD
    UI[Chat UI (Next.js)] -->|HTTP GET /greeting| GREETING_ENGINE[Greeting Engine]
    GREETING_ENGINE -->|0ms Cache| UI
    
    UI -->|HTTP POST| API(Express API)
    API --> AUTH[JWT Authentication]
    
    AUTH --> GIBBERISH[Gibberish Detector]
    GIBBERISH -->|Rejects 'asdf'| API
    
    GIBBERISH --> FAST_TRACK[Fast Track Semantic Cache]
    FAST_TRACK -->|0.5 Overlap Hit| API
    
    FAST_TRACK --> ORCHESTRATOR{Orchestrator Service}
    
    ORCHESTRATOR -->|Tool Request| DB_TOOLS[Domain Tool Wrappers]
    DB_TOOLS --> MONGO[(MongoDB)]
    MONGO --> DB_TOOLS
    DB_TOOLS --> ORCHESTRATOR
    
    ORCHESTRATOR -->|Generative / Summary| GEMINI[Gemini LLM]
    GEMINI --> ORCHESTRATOR
    
    ORCHESTRATOR -->|Final Markdown| API
    API -->|Response Stream| UI
```

---

## 2. Request Lifecycle & Flow

When a user types a message (e.g., *"Show me all high-priority tasks assigned to John"*), the system executes the following flow:

1. **Client Submission**: The Next.js client sends the raw text to `POST /api/chat`.
2. **Security & Context Extraction**: The backend verifies the JWT and extracts the `userId` and `role`. This is critical—the AI only operates on data the user is authorized to see.
3. **Gibberish Detection (Pre-Flight)**: The input is checked for random keyboard mashing (`asdfgh`). If detected, it is rejected immediately to save LLM tokens.
4. **Fast Track Semantic Cache (V2)**: The input is tokenized and scored against 18+ hardcoded Enterprise policies. If the overlap score crosses `0.5` and the user's role matches, it instantly returns the cached answer (`FAST_TRACK_CACHE_HIT`), bypassing the LLM entirely.
5. **Memory Retrieval**: If no cache hit occurs, the `conversationService` fetches the last 10 messages from `ConversationMemory` to provide context to the LLM.
4. **Intent Detection & Decision (Gemini Function Calling)**:
   - The Orchestrator sends the prompt, context, and a list of **Available Tools** (JSON schemas of our backend services) to Gemini.
   - Gemini decides if it needs to call a tool (e.g., `fetchUserTasks(userId: "John", priority: "high")`) or just respond conversationally.
5. **Business Logic Execution**:
   - If Gemini requests a tool, the Orchestrator pauses the AI generation and triggers the appropriate Tool Wrapper (e.g., `taskService.ts`).
   - The Tool Wrapper safely executes the database query via the existing Application Business Logic.
6. **Synthesis**: The Orchestrator feeds the JSON results from MongoDB back to Gemini. Gemini formats the data into a human-readable Markdown response.
7. **Delivery**: The final text is streamed back to the Next.js UI, rendered via the `MarkdownRenderer`.

---

## 3. The Orchestrator (Decision Engine)

The Orchestrator is the brain of the backend chatbot infrastructure. It is responsible for bridging the determinism of traditional code with the non-determinism of LLMs.

### Responsibilities:
- **System Prompting**: Injecting the exact rules, tone, and constraints the Assistant must follow based on the user's role (Admin vs Member).
- **Tool Mapping**: Translating Gemini's structured JSON tool requests into actual TypeScript function calls.
- **Error Handling**: If a database query fails, the Orchestrator feeds the error back to Gemini so it can apologize and explain the issue to the user gracefully.

---

## 4. RAG (Retrieval-Augmented Generation) Architecture

To support document querying, the Chatbot incorporates an isolated RAG pipeline:

1. **Upload & Extract**: A user uploads a PDF. The backend extracts raw text using `pdf-parse`.
2. **Chunking**: Text is split into chunks of ~800 characters with a 150-character overlap (to preserve context boundaries).
3. **Embedding Generation**: Each chunk is passed to Gemini (`gemini-embedding-2`) to generate a 768-dimensional vector representation.
4. **Vector Storage**: Embeddings are saved to MongoDB in the `document_chunks` collection.
5. **Retrieval**: When a user asks a question about the document, the question is embedded, and MongoDB `$vectorSearch` retrieves the top 5 most semantically similar chunks.
6. **Generation**: The retrieved chunks are injected as Context into a rigid system prompt, and Gemini generates the final answer grounded solely in the document.

---

## 5. Existing Module Integration

A core design principle of this architecture is **DRY (Don't Repeat Yourself)** regarding business logic. The chatbot **never** mutates or reads MongoDB directly. 

```text
Chatbot Service
       ↓
[Tool Wrappers]
       ↓
Core Application Controllers/Services
       ↓
Mongoose Models
       ↓
MongoDB
```
By forcing the Chatbot to use the exact same internal functions that the Next.js frontend uses, we guarantee that all validation, security checks, and RBAC rules are universally enforced.

---

## 5. Security & Isolation

- **Role-Based Prompting**: Admins receive a system prompt allowing destructive actions (e.g., "You can reassign tasks"). Members receive restricted prompts (e.g., "You can only view your own tasks").
- **Context Locking**: The LLM prompt has been explicitly constrained to reject queries unrelated to the company's work, refusing generic questions (like recipes, sports) to maintain strict professional context.
- **Stateless Tooling**: The LLM has no memory of the database schema. It only knows about the structured Tools explicitly provided to it by the Orchestrator. This prevents Prompt Injection attacks from extracting arbitrary DB fields (like password hashes).
- **Rate Limiting**: AI endpoints are heavily rate-limited by IP and User ID to prevent runaway token costs and DDoS attacks.

---

## 6. Chat History Data Model

The `ChatHistory` schema acts as the root for all conversation interactions, extending beyond simple titles:
- **Pinned States (`isPinned: boolean`)**: Enforces top-level sorting on the frontend `ChatContext` and backend aggregation.
- **Archival States (`isArchived: boolean`)**: Provides a non-destructive soft-delete alternative, sequestering chats to a dedicated `ArchiveView` via the `GET /history/archived` route, while keeping the main `GET /history` clean.
- **Project Linkages**: Chats can be clustered into user-defined Projects for deep organizational categorization.
