# AI Employee Assistant - Intents Specification

This document categorizes and defines the specific intents the Chatbot's **Decision Engine (Orchestrator)** is trained to recognize. By mapping user utterances to these intents, the system knows exactly which domain tool to execute.

---

## 1. Task Management Intents

These intents interface with the `taskService.ts` tool wrapper and query the `Tasks` collection.

### `FETCH_TASKS`
- **Description**: Retrieves a list of tasks based on filters.
- **Utterances**: 
  - *"What are my pending tasks?"*
  - *"Show me all high-priority tasks for this week."*
  - *(Admin)* *"What tasks are currently assigned to Sarah?"*
- **Parameters Extracted**: `status`, `priority`, `assignee`, `dateRange`.

### `CREATE_TASK`
- **Description**: Creates a new task and assigns it to a user.
- **Utterances**: 
  - *(Admin)* *"Create a high priority task for John to finish the Q3 financial report by Friday."*
- **Parameters Extracted**: `title`, `description`, `assigneeId`, `priority`, `dueDate`.

### `UPDATE_TASK_STATUS`
- **Description**: Changes the status of an existing task.
- **Utterances**: 
  - *"Mark the 'Update UI' task as completed."*
  - *"Move my database migration task to in-progress."*
- **Parameters Extracted**: `taskIdentifier` (title or ID), `newStatus`.

---

## 2. Employee & Team Intents

These intents interface with the `employeeService.ts` tool wrapper and query the `Users` collection.

### `FETCH_TEAM_MEMBERS`
- **Description**: Retrieves information about colleagues or subordinates.
- **Utterances**:
  - *"Who is currently on my team?"*
  - *(Admin)* *"Show me a list of all active employees."*
- **Parameters Extracted**: `department` (if applicable), `status`.

### `GET_EMPLOYEE_WORKLOAD`
- **Description**: Evaluates how many active tasks a specific employee currently holds.
- **Utterances**:
  - *(Admin)* *"How busy is Alex right now?"*
  - *(Admin)* *"Does Sarah have capacity for a new high-priority task?"*
- **Parameters Extracted**: `employeeName` or `employeeId`.

---

## 3. Communication & Announcement Intents

These intents interface with the `communicationService.ts` tool wrapper.

### `FETCH_ANNOUNCEMENTS`
- **Description**: Retrieves recent workspace-wide broadcasts.
- **Utterances**:
  - *"What are the latest announcements from the admin?"*
  - *"Did I miss any important updates this week?"*
- **Parameters Extracted**: `dateRange`.

### `CREATE_ANNOUNCEMENT`
- **Description**: Allows an admin to broadcast a message to the team.
- **Utterances**:
  - *(Admin)* *"Send an announcement to everyone that the server maintenance is at 5 PM."*
- **Parameters Extracted**: `messageContent`, `priority`.

---

## 4. Reporting & Analytics Intents

These intents interface with the `reportService.ts` tool wrapper to aggregate data.

### `GENERATE_PRODUCTIVITY_REPORT`
- **Description**: Aggregates task completion rates over a specific period.
- **Utterances**:
  - *(Admin)* *"Generate a productivity report for the engineering team for last month."*
  - *"How many tasks did I complete this week?"*
- **Parameters Extracted**: `timeframe`, `targetUser` (self vs team).

---

## 5. Conversational & General Intents

These intents bypass the database tools and are handled directly by the Gemini LLM's general knowledge or specific RAG context.

### `GENERAL_CHAT`
- **Description**: Greetings, pleasantries, or general AI questions.
- **Utterances**:
  - *"Hello, how are you?"*
  - *"Can you help me format this email?"*
  - *"What can you do?"*
- **Action**: Bypasses tools; routes directly to standard LLM generation.

### `POLICY_QUERY` (Phase 3 - Future)
- **Description**: Queries the company knowledge base (RAG).
- **Utterances**:
  - *"What is our policy on remote work?"*
  - *"How many paid leave days do I get?"*
- **Action**: Routes to Vector Search / Embedding Service before calling Gemini.

---

## Security Matrix

| Intent | Member Access | Admin Access |
| :--- | :---: | :---: |
| `FETCH_TASKS` | Own Tasks Only | All Tasks |
| `CREATE_TASK` | No | Yes |
| `UPDATE_TASK_STATUS`| Own Tasks Only | All Tasks |
| `GET_EMPLOYEE_WORKLOAD`| No | Yes |
| `CREATE_ANNOUNCEMENT` | No | Yes |
| `GENERAL_CHAT` | Yes | Yes |

*Note: The Orchestrator strictly enforces this matrix. If a Member attempts `CREATE_TASK`, the Orchestrator will intercept it and reply that they lack permissions, without ever hitting the database.*
