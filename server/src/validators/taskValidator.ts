import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

const statusValues = ['todo', 'in_progress', 'completed', 'overdue', 'cancelled'];
const priorityValues = ['low', 'medium', 'high'];

export const taskCreateValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.TITLE_REQUIRED)
    .isLength({ max: 150 })
    .withMessage(VALIDATION_MESSAGES.TASK.TITLE_TOO_LONG),
  body('description')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.DESCRIPTION_REQUIRED)
    .isLength({ max: 500 })
    .withMessage(VALIDATION_MESSAGES.TASK.DESCRIPTION_TOO_LONG),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage(VALIDATION_MESSAGES.TASK.STATUS_INVALID(statusValues)),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(VALIDATION_MESSAGES.TASK.PRIORITY_INVALID(priorityValues)),
  body('dueDate')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.DUE_DATE_REQUIRED)
    .isISO8601()
    .withMessage(VALIDATION_MESSAGES.TASK.DUE_DATE_INVALID),
  body('assignedTo')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.ASSIGNED_TO_REQUIRED)
    .isMongoId()
    .withMessage(VALIDATION_MESSAGES.TASK.ASSIGNED_TO_INVALID),
];

export const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.TITLE_EMPTY)
    .isLength({ max: 150 })
    .withMessage(VALIDATION_MESSAGES.TASK.TITLE_TOO_LONG),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.TASK.DESCRIPTION_EMPTY)
    .isLength({ max: 500 })
    .withMessage(VALIDATION_MESSAGES.TASK.DESCRIPTION_TOO_LONG),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage(VALIDATION_MESSAGES.TASK.STATUS_INVALID(statusValues)),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(VALIDATION_MESSAGES.TASK.PRIORITY_INVALID(priorityValues)),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage(VALIDATION_MESSAGES.TASK.DUE_DATE_INVALID),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage(VALIDATION_MESSAGES.TASK.ASSIGNED_TO_INVALID),
];
