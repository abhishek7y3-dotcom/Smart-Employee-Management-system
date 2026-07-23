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
  updateAnnouncement,
  togglePinAnnouncement,
  deleteAnnouncement,
  sendBroadcast,
  getAnalytics,
} from '../controllers/communicationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Saare communication routes secure hain (Bina login ke error aayega)
router.use(authenticate);

// Employees (Message ya task assign karne ke liye sabhi employees ki list dena)
router.get('/employees', getEmployees);

// Conversations (1-on-1 ya group chats manage karna)
router.get('/conversations', getConversations); // Saari chats lana
router.get('/conversations/:id', getConversationById); // Ek specific chat open karna
router.post('/conversations', createConversation); // Nayi chat start karna
router.put('/conversations/:id', updateConversation); // Chat details update karna
router.delete('/conversations/:id', deleteConversation); // Chat delete karna

// Messages (Chat ke andar ki baatein)
router.get('/conversations/:conversationId/messages', getMessages); // Chat ke purane messages nikalna
router.post('/conversations/:conversationId/messages', sendMessage); // Naya message send karna

// Announcements (Company ke notice board)
router.get('/announcements', getAnnouncements); // Padhne ke liye
router.post('/announcements', createAnnouncement); // Naya notice banane ke liye (admin)
router.put('/announcements/:id', updateAnnouncement); // Notice edit karna
router.patch('/announcements/:id/pin', togglePinAnnouncement); // Notice ko top par pin/unpin karna
router.delete('/announcements/:id', deleteAnnouncement); // Notice hatana

// Broadcast
router.post('/broadcast', sendBroadcast);

// Analytics
router.get('/analytics', getAnalytics);

export default router;