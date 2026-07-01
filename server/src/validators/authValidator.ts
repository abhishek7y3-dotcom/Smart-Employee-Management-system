import { body } from 'express-validator';

const strictEmailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const loginValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address '),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address '),
  body('otp').notEmpty().withMessage('Verification code is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];
