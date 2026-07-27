import express from 'express';
import { 
  getProfile, 
  updatePreferences, 
  updatePassword, 
  getAdminTeam 
} from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticate, getProfile);
router.put('/preferences', authenticate, updatePreferences);
router.put('/password', authenticate, updatePassword);
router.get('/team', authenticate, getAdminTeam);

export default router;
