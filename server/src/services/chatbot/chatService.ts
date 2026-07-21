import { IUser } from '../../models/User';
import ChatHistory from '../../models/ChatHistory';
import ConversationMemory from '../../models/ConversationMemory';
import { sendPromptWithTools } from './geminiService';
import { fetchTasksDeclaration, handleFetchTasks, createTaskDeclaration, handleCreateTask, updateTaskStatusDeclaration, handleUpdateTaskStatus } from './taskService';
import { getEmployeeWorkloadDeclaration, handleGetEmployeeWorkload } from './employeeService';
import { createAnnouncementDeclaration, handleCreateAnnouncement, fetchAnnouncementsDeclaration, handleFetchAnnouncements } from './communicationService';

// Define the system prompt
const getSystemPrompt = (user: IUser) => `
You are the Employee Task Manager Assistant. 
The user is a ${user.role}. 
If they are an admin, they can view all tasks, create tasks, evaluate employee workloads, and broadcast announcements.
If they are a member, they can only view their own tasks, update their own tasks, and view announcements.
Always use the provided tools to fetch real data before answering. Do not hallucinate task data.

CRITICAL INSTRUCTION: You are strictly restricted to answering questions related to the company, employee tasks, workloads, announcements, or documents uploaded by the user. If the user asks about ANYTHING ELSE (e.g. general knowledge, casual chat unrelated to work, outside topics), you MUST politely refuse to answer and remind them that you are specifically an Employee Task Manager Assistant.
`;

export async function processChat(user: IUser, message: string, conversationId?: string) {
  let chatHistoryId = conversationId;

  if (!chatHistoryId) {
    let title = 'New Conversation';
    try {
      const titlePrompt = `Generate a very short (2-5 words) summary title for a conversation that begins with this message. Do not include quotes or formatting. Just the title text.\n\nMessage: "${message}"`;
      const titleResponse = await sendPromptWithTools('You are a helpful summarizer.', [], titlePrompt, []);
      if (titleResponse.text()) {
        title = titleResponse.text().trim().replace(/^["']|["']$/g, '');
      }
    } catch (err) {
      console.warn('Failed to generate chat title with AI, using fallback.', err);
      title = message.split(' ').slice(0, 5).join(' ') + (message.split(' ').length > 5 ? '...' : '');
    }

    const newHistory = await ChatHistory.create({
      userId: user._id,
      title: title,
    });
    chatHistoryId = newHistory._id.toString();
  }

  await ConversationMemory.create({ chatHistoryId, role: 'user', content: message });

  const pastMessages = await ConversationMemory.find({ chatHistoryId }).sort({ createdAt: -1 }).limit(20).lean();
  let rawHistory = pastMessages.reverse().map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || ' ' }],
  }));
  rawHistory.pop(); // Remove the current user message

  // Gemini requires strictly alternating history starting with 'user'
  const history: any[] = [];
  for (const msg of rawHistory) {
    if (history.length === 0) {
      if (msg.role === 'user') history.push(msg);
    } else {
      if (history[history.length - 1].role !== msg.role) {
        history.push(msg);
      }
    }
  }

  // Ensure the history ends with 'model' before we send a new 'user' message
  if (history.length > 0 && history[history.length - 1].role === 'user') {
    history.pop();
  }

  const tools = [
    { 
      functionDeclarations: [
        fetchTasksDeclaration, 
        createTaskDeclaration, 
        updateTaskStatusDeclaration,
        getEmployeeWorkloadDeclaration,
        createAnnouncementDeclaration,
        fetchAnnouncementsDeclaration
      ] 
    }
  ];

  const response = await sendPromptWithTools(getSystemPrompt(user), history, message, tools);
  
  let finalContent = '';
  try {
    finalContent = response.text();
  } catch (e) {
    // text() throws if there is no text part (which is common when a function call is made)
  }

  const functionCall = response.functionCalls()?.[0];
  let systemEvents: string[] = [];

  if (functionCall) {
    let resultJSON: any = null;
    const args = functionCall.args as any;

    try {
      switch (functionCall.name) {
        case 'fetchTasks':
          resultJSON = await handleFetchTasks(user, args);
          break;
        case 'createTask':
          resultJSON = await handleCreateTask(user, args);
          systemEvents.push('TASK_CREATED');
          break;
        case 'updateTaskStatus':
          resultJSON = await handleUpdateTaskStatus(user, args);
          systemEvents.push('TASK_UPDATED');
          break;
        case 'getEmployeeWorkload':
          resultJSON = await handleGetEmployeeWorkload(user, args);
          break;
        case 'createAnnouncement':
          resultJSON = await handleCreateAnnouncement(user, args);
          systemEvents.push('ANNOUNCEMENT_CREATED');
          break;
        case 'fetchAnnouncements':
          resultJSON = await handleFetchAnnouncements(user, args);
          break;
        default:
          resultJSON = { error: 'Unknown tool called by AI.' };
      }
    } catch (err: any) {
      resultJSON = { error: 'Internal server error while executing tool: ' + err.message };
    }
    
    const followUpPrompt = `The user originally asked: "${message}". The tool returned this JSON: ${JSON.stringify(resultJSON)}. Please synthesize it for the user in markdown.`;
    const followUpResponse = await sendPromptWithTools(getSystemPrompt(user), history, followUpPrompt, []);
    finalContent = followUpResponse.text();
  }

  const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: finalContent || 'I successfully processed your request, but did not generate a text response.' });

  return {
    conversationId: chatHistoryId,
    message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt },
    systemEvents
  };
}
