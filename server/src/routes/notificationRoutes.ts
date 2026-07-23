import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Notifications check karne ke liye user ka login hona zaroori hai
router.use(authenticate); 

router.get('/', getNotifications); // User ki saari nayi aur purani notifications lana
router.put('/read-all', markAllAsRead); // Ek click me sabhi notifications ko "read" (padh liya) mark karna
router.put('/:id/read', markAsRead); // Kisi ek specific notification par click karke usko read karna

export default router;
