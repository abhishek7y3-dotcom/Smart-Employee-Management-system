import express from 'express';
import { getNoteByDate, saveNote, getAllNotes } from '../controllers/noteController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/history', getAllNotes);
router.get('/:date', getNoteByDate);
router.post('/:date', saveNote);

export default router;
