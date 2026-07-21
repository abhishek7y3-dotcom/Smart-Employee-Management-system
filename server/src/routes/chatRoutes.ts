import { Router } from 'express';
import { handleChatMessage, getChatHistory, getArchivedChats, getConversation, createLibrary, getLibraries, addChatToLibrary, createProject, getProjects, addChatToProject, deleteChat, renameChat, pinChat, archiveChat, renameProject, deleteProject, pinProject, archiveProject } from '../controllers/chatController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all chat routes
router.use(authenticate);

router.post('/', handleChatMessage);
router.get('/history', getChatHistory);
router.get('/archived', getArchivedChats);
router.get('/history/:conversationId', getConversation);
router.delete('/history/:chatId', deleteChat);
router.put('/history/:chatId/rename', renameChat);
router.put('/history/:chatId/pin', pinChat);
router.put('/history/:chatId/archive', archiveChat);

// Library routes
router.post('/library', createLibrary);
router.get('/library', getLibraries);
router.post('/library/:libraryId/chat', addChatToLibrary);

// Project routes
router.post('/project', createProject);
router.get('/project', getProjects);
router.post('/project/:projectId/chat', addChatToProject);
router.delete('/project/:projectId', deleteProject);
router.put('/project/:projectId/rename', renameProject);
router.put('/project/:projectId/pin', pinProject);
router.put('/project/:projectId/archive', archiveProject);

export default router;
