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

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', taskCreateValidation, validateRequest, createTask);
router.put('/:id', taskUpdateValidation, validateRequest, updateTask);
router.delete('/:id', deleteTask);

export default router;
