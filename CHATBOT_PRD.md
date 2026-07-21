# Product Requirements Document (PRD): AI Employee Assistant

## 1. Overview & Purpose
The **AI Employee Assistant** is an intelligent, natural language interface integrated directly into the Employee Task Manager. It is designed to act as a virtual assistant for both Employees and Administrators. 
Instead of replacing the existing dashboard, the Chatbot serves as a powerful semantic layer, allowing users to query data, execute actions, and generate reports simply by conversing with it.

## 2. Target Audience & Roles
The Assistant respects the existing **Role-Based Access Control (RBAC)** architecture of the application:
- **Administrators**: Can ask the chatbot to fetch company-wide metrics, assign tasks to any employee, broadcast announcements, and generate productivity reports.
- **Employees (Members)**: Can ask the chatbot to summarize their personal pending tasks, prioritize their workload, and provide suggestions for time management.

## 3. Core Features & Capabilities

### Phase 1: MVP (Minimum Viable Product)
- **Natural Language Querying**: "What are my pending tasks for today?"
- **Action Execution**: "Create a high-priority task for John to review the Q3 report."
- **Intent Detection & Routing**: The system determines if the user is asking a general question (answered by Gemini) or requesting data (routed to MongoDB).
- **Contextual Memory**: The bot remembers the history of the current conversation session to handle follow-up questions.

### Phase 2: Analytics & Suggestions
- **Smart Recommendations**: "You have 3 overdue tasks, would you like me to flag them for review?"
- **Automated Reporting**: "Generate a summary of the team's performance this week."

### Phase 3: RAG & Expansion (Future)
- **Company Knowledge Base (RAG)**: Querying PDF policies, HR documents, and onboarding material.
- **Calendar & Leave Integration**: Syncing with calendars and managing attendance.

## 4. Technical Architecture

### High-Level Flow
```mermaid
graph TD
    A[User (Next.js UI)] -->|Sends Message| B(Express API: /api/chat)
    B --> C{Orchestrator / Intent Service}
    C -->|Database Query Needed| D[Domain Tools: Task, Employee]
    C -->|General Query| E[Gemini API]
    D --> F[(MongoDB)]
    F --> E
    E -->|Formatted Response| B
    B -->|Streamed Output| A
```

### Components
1. **Frontend (Next.js)**: Features a dedicated `/chatbot` route. Includes modular components like `ChatWindow`, `ChatBubble`, and `TypingIndicator`.
2. **Backend (Express)**: Exposes `POST /api/chat`. Protected by JWT middleware and Rate Limiting.
3. **Decision Engine**: Leverages Gemini Function Calling to decide whether to query the database or just chat.
4. **Tool Handlers**: Thin wrappers around existing core services (e.g., `taskTool.ts` calls `taskService.ts`) to ensure business logic is not duplicated.

## 5. Non-Functional Requirements
- **Performance (Streaming)**: The chatbot must utilize streaming responses (SSE or WebSockets) to reduce perceived latency to < 1 second.
- **Security**: The chatbot must strictly inherit the JWT context of the user making the request. An employee must never be able to access Admin data via the chatbot.
- **Cost Efficiency**: AI interactions should be optimized. Context windows should be limited to the last 10 messages to save on token costs.
- **Modularity**: The chatbot must fail gracefully. If the Gemini API is down, the rest of the application must continue to function normally.

## 6. Success Metrics
- **Adoption Rate**: > 50% of active users querying the chatbot weekly.
- **Task Creation Speed**: 30% reduction in time taken to create and assign tasks via natural language vs. manual form entry.
- **Error Rate**: < 5% of intents misclassified by the Decision Engine.
