import { Router } from 'express';
import {
  getEmployees,
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  getAnnouncements,
  createAnnouncement,
  togglePinAnnouncement,
  deleteAnnouncement,
  sendBroadcast,
  getAnalytics,
} from '../controllers/communicationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All communication routes require authentication
router.use(authenticate);

// Employees (for recipient selection)
router.get('/employees', getEmployees);

// Conversations
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);
router.post('/conversations', createConversation);
router.put('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversation);

// Messages
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:id/pin', togglePinAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Broadcast
router.post('/broadcast', sendBroadcast);

// Analytics
router.get('/analytics', getAnalytics);

export default router;