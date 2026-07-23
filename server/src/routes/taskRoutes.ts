import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';
import { taskCreateValidation, taskUpdateValidation } from '../validators/taskValidator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Task routes ke liye security (sirf authorized employees hi tasks dekh/bana sakte hain)
router.use(authenticate);

router.get('/', getTasks); // Database se tasks ki list lana (with filters)
router.get('/:id', getTaskById); // Kisi ek specific task ki poori details nikalna
// Naya task banate waqt pehle validation rules check hote hain (taskCreateValidation), phir banta hai
router.post('/', taskCreateValidation, validateRequest, createTask);
// Task update karte waqt rules check hote hain
router.put('/:id', taskUpdateValidation, validateRequest, updateTask);
router.delete('/:id', deleteTask); // Task ko system se delete karna

export default router;
