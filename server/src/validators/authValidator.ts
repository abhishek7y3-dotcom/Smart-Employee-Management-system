import { body } from 'express-validator';

const strictEmailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address')
    .isLength({ max: 254 }).withMessage('Email cannot exceed 254 characters'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
];

export const loginValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address')
    .isLength({ max: 254 }).withMessage('Email cannot exceed 254 characters'),
  body('password')
    .isLength({ max: 128 }).withMessage('Password cannot exceed 128 characters'),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address ')
    .isLength({ max: 254 }).withMessage('Email cannot exceed 254 characters'),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address ')
    .isLength({ max: 254 }).withMessage('Email cannot exceed 254 characters'),
  body('otp').notEmpty().withMessage('Verification code is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
];
