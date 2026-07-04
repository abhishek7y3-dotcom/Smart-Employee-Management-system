import { body } from 'express-validator';

const strictEmailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

export const registerValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .matches(strictEmailRegex).withMessage('Please enter a valid email address')
    .isLength({ max: 254 }).withMessage('Email cannot exceed 254 characters'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters')
    .matches(/^[a-zA-Z][a-zA-Z.'\-]*$/)
    .withMessage("First name must start with a letter and contain only letters, dots, quotes, and hyphens"),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .matches(/^[a-zA-Z][a-zA-Z.'\- ]*$/)
    .withMessage("Last name must start with a letter and contain only letters, spaces, dots, quotes, and hyphens"),
  body('mobileNumber')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  body('countryCode')
    .trim()
    .notEmpty()
    .withMessage('Country code is required'),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required'),
];

export const loginValidation = [
  body('password')
    .isLength({ max: 128 }).withMessage('Password cannot exceed 128 characters'),
  body().custom((value) => {
    if (!value.email && !value.mobileNumber) {
      throw new Error('Email or Mobile Number is required');
    }
    if (value.email) {
      if (!strictEmailRegex.test(value.email) || value.email.length > 254) {
        throw new Error('Please enter a valid email address');
      }
    } else {
      if (!value.countryCode) {
        throw new Error('Country code is required');
      }
      if (!value.mobileNumber || !/^\d{10}$/.test(value.mobileNumber)) {
        throw new Error('Mobile number must be exactly 10 digits');
      }
    }
    return true;
  }),
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
