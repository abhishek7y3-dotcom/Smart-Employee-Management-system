# AI Employee Assistant - API Specification

This document details the REST API endpoints required to integrate the Next.js frontend with the Express backend for the Chatbot module.

---

## Base URL
`/api/chat`

## Authentication
All endpoints require a valid JWT token passed in the `Authorization` header as a Bearer token. The API relies on the existing `verifyToken` middleware.

```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Send Message
Sends a user message to the AI Assistant and returns the response.

- **Endpoint**: `POST /`
- **Protected**: Yes
- **Rate Limit**: Strictly enforced (e.g., 20 requests per minute per user).

### Request Body (JSON)
```json
{
  "message": "What are my pending tasks for today?",
  "conversationId": "507f1f77bcf86cd799439011" // Optional. If omitted, starts a new conversation.
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "conversationId": "507f1f77bcf86cd799439011",
    "message": {
      "role": "assistant",
      "content": "You currently have 3 pending tasks for today:\n1. Update UI\n2. Fix Database Bug\n3. Review PR",
      "timestamp": "2026-07-21T10:00:00.000Z"
    }
  }
}
```

### Error Responses
- **400 Bad Request**: Missing `message` field.
- **401 Unauthorized**: Invalid or missing JWT.
- **429 Too Many Requests**: User has exceeded the rate limit.
- **500 Internal Server Error**: Failed to reach Gemini API.

---

## 2. Get All Conversations
Retrieves a paginated list of previous conversation sessions for the authenticated user.

- **Endpoint**: `GET /history`
- **Protected**: Yes

### Request Query Parameters
- `page` (optional): Page number (default: 1).
- `limit` (optional): Items per page (default: 10).

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "conversationId": "507f1f77bcf86cd799439011",
      "title": "Task Prioritization",
      "updatedAt": "2026-07-21T09:30:00.000Z"
    },
    {
      "conversationId": "603f1f77bcf86cd799439122",
      "title": "Checking Employee Status",
      "updatedAt": "2026-07-20T14:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "pages": 2
  }
}
```

---

## 3. Get Conversation Messages
Retrieves the full message history for a specific conversation session.

- **Endpoint**: `GET /history/:conversationId`
- **Protected**: Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "conversationId": "507f1f77bcf86cd799439011",
    "messages": [
      {
        "role": "user",
        "content": "What are my pending tasks for today?",
        "timestamp": "2026-07-21T09:59:55.000Z"
      },
      {
        "role": "assistant",
        "content": "You currently have 3 pending tasks...",
        "timestamp": "2026-07-21T10:00:00.000Z"
      }
    ]
  }
}
```

### Error Responses
- **404 Not Found**: Conversation does not exist or does not belong to the user.

---

## 4. Delete Conversation
Permanently deletes a specific conversation session and its associated messages.

- **Endpoint**: `DELETE /history/:conversationId`
- **Protected**: Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Conversation deleted successfully."
}
```

### Error Responses
- **404 Not Found**: Conversation does not exist or does not belong to the user.

---

## Future Endpoints (Phase 2)
- `POST /stream`: Streaming equivalent of `POST /` using Server-Sent Events (SSE) for lower perceived latency.
- `GET /suggestions`: Returns dynamic suggested prompts based on the user's current context and role.

---

## 5. RAG (Document Q&A) Endpoints

The RAG module provides endpoints to upload and query PDF documents using Vector Search.

### 5.1 Upload Document
- **Endpoint**: `POST /rag/upload`
- **Protected**: Yes
- **Body**: `multipart/form-data` with a `file` field containing the PDF.

### 5.2 Ask Document Question
- **Endpoint**: `POST /rag/ask`
- **Protected**: Yes
- **Body**: JSON `{ "documentId": "...", "question": "..." }`

### 5.3 Get Documents
- **Endpoint**: `GET /rag/documents`
- **Protected**: Yes
- **Returns**: A list of documents uploaded by the current user.
