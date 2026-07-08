import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

const strictEmailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

export const registerValidation = [
  body('email')
    .isEmail().withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_REQUIRED)
    .matches(strictEmailRegex).withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID)
    .isLength({ max: 254 }).withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_TOO_LONG),
  body('password')
    .isLength({ min: 8, max: 64 })
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_LENGTH_RANGE)
    .matches(/[A-Z]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_UPPERCASE)
    .matches(/[a-z]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_LOWERCASE)
    .matches(/[0-9]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_NUMBER)
    .matches(/[!@#$%^&*()_+=\-[\]{};:',.<>?/\\|`~]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_SPECIAL_CHAR)
    .custom((value) => {
      if (value.trim().length === 0) {
        throw new Error(VALIDATION_MESSAGES.AUTH.PASSWORD_SPACES_ONLY);
      }
      const commonPasswords = ['password', 'password123', 'qwerty', 'admin123', '12345678', 'welcome123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error(VALIDATION_MESSAGES.AUTH.PASSWORD_TOO_COMMON);
      }
      const allowedRegex = /^[a-zA-Z0-9!@#$%^&*()_+=\-[\]{};:',.<>?/\\|`~\s]*$/;
      if (!allowedRegex.test(value)) {
        throw new Error(VALIDATION_MESSAGES.AUTH.PASSWORD_INVALID_CHARS);
      }
      return true;
    }),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.AUTH.FIRST_NAME_REQUIRED)
    .isLength({ min: 2 })
    .withMessage(VALIDATION_MESSAGES.AUTH.FIRST_NAME_MIN_LENGTH)
    .matches(/^[a-zA-Z][a-zA-Z.'\-]*$/)
    .withMessage(VALIDATION_MESSAGES.AUTH.FIRST_NAME_INVALID),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.AUTH.LAST_NAME_REQUIRED)
    .matches(/^[a-zA-Z][a-zA-Z.'\- ]*$/)
    .withMessage(VALIDATION_MESSAGES.AUTH.LAST_NAME_INVALID),
  body('mobileNumber')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage(VALIDATION_MESSAGES.AUTH.MOBILE_NUMBER_INVALID),
  body('countryCode')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.AUTH.COUNTRY_CODE_REQUIRED),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.AUTH.GENDER_REQUIRED),
];

export const loginValidation = [
  body('password')
    .isLength({ max: 128 }).withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_TOO_LONG),
  body().custom((value) => {
    if (!value.email && !value.mobileNumber) {
      throw new Error(VALIDATION_MESSAGES.AUTH.LOGIN_CREDENTIALS_REQUIRED);
    }
    if (value.email) {
      if (!strictEmailRegex.test(value.email) || value.email.length > 254) {
        throw new Error(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID);
      }
    } else {
      if (!value.countryCode) {
        throw new Error(VALIDATION_MESSAGES.AUTH.COUNTRY_CODE_REQUIRED);
      }
      if (!value.mobileNumber || !/^\d{10}$/.test(value.mobileNumber)) {
        throw new Error(VALIDATION_MESSAGES.AUTH.MOBILE_NUMBER_INVALID);
      }
    }
    return true;
  }),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_REQUIRED)
    .matches(strictEmailRegex).withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID)
    .isLength({ max: 254 }).withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_TOO_LONG),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail().withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_REQUIRED)
    .matches(strictEmailRegex).withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID)
    .isLength({ max: 254 }).withMessage(VALIDATION_MESSAGES.AUTH.EMAIL_TOO_LONG),
  body('otp').notEmpty().withMessage(VALIDATION_MESSAGES.AUTH.OTP_REQUIRED),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_RESET_LENGTH_RANGE),
];
