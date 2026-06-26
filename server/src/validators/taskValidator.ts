import { body } from 'express-validator';

const statusValues = ['todo', 'in_progress', 'completed', 'overdue'];
const priorityValues = ['low', 'medium', 'high'];

export const taskCreateValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage(`Status must be one of: ${statusValues.join(', ')}`),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(`Priority must be one of: ${priorityValues.join(', ')}`),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assignedTo')
    .notEmpty()
    .withMessage('AssignedTo is required')
    .isMongoId()
    .withMessage('AssignedTo must be a valid user ID'),
];

export const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage(`Status must be one of: ${statusValues.join(', ')}`),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(`Priority must be one of: ${priorityValues.join(', ')}`),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('AssignedTo must be a valid user ID'),
];
