import { Router } from 'express';
import { handleChatMessage, getChatHistory, getArchivedChats, getConversation, createLibrary, getLibraries, addChatToLibrary, createProject, getProjects, addChatToProject, deleteChat, renameChat, pinChat, archiveChat, renameProject, deleteProject, pinProject, archiveProject, getGreeting } from '../controllers/chatController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// In saare chat routes ko access karne ke liye user ka login hona (token hona) zaroori hai
router.use(authenticate);

// Naya chat message bhejna ya bot se baat karna
router.post('/', handleChatMessage);
// Greeting lana (Zero-latency AI greeting)
router.get('/greeting', getGreeting);
// Purani chats (history) nikalna
router.get('/history', getChatHistory);
// Archive ki gayi chats nikalna
router.get('/archived', getArchivedChats);
// Kisi ek specific conversation/chat ki details lana
router.get('/history/:conversationId', getConversation);
router.delete('/history/:chatId', deleteChat);
router.put('/history/:chatId/rename', renameChat);
router.put('/history/:chatId/pin', pinChat);
router.put('/history/:chatId/archive', archiveChat);

// Library routes (Chat ko folder me save karne ke liye)
router.post('/library', createLibrary); // Nayi library/folder banana
router.get('/library', getLibraries); // Saari libraries lana
router.post('/library/:libraryId/chat', addChatToLibrary); // Chat ko kisi library me add karna

// Project routes (Project ke hisab se chats manage karna)
router.post('/project', createProject); // Naya project banana
router.get('/project', getProjects); // Projects ki list lana
router.post('/project/:projectId/chat', addChatToProject); // Chat ko project se link karna
router.delete('/project/:projectId', deleteProject); // Project delete karna
router.put('/project/:projectId/rename', renameProject);
router.put('/project/:projectId/pin', pinProject);
router.put('/project/:projectId/archive', archiveProject);

export default router;
