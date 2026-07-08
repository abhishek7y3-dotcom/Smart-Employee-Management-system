/**
 * Centralized Validation Messages for backend request validation.
 * Grouped by domain (AUTH, TASK) to maintain single responsibility and clean architecture.
 */

export const VALIDATION_MESSAGES = {
  AUTH: {
    EMAIL_REQUIRED: 'Valid email is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    EMAIL_TOO_LONG: 'Email cannot exceed 254 characters',
    
    PASSWORD_LENGTH_RANGE: 'Password must be between 8 and 64 characters',
    PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter',
    PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter',
    PASSWORD_NUMBER: 'Password must contain at least one number',
    PASSWORD_SPECIAL_CHAR: 'Password must contain at least one special character',
    PASSWORD_SPACES_ONLY: 'Password cannot consist only of spaces',
    PASSWORD_TOO_COMMON: 'This password is too common and insecure',
    PASSWORD_INVALID_CHARS: 'Password contains invalid characters',
    PASSWORD_TOO_LONG: 'Password cannot exceed 128 characters',
    PASSWORD_RESET_LENGTH_RANGE: 'Password must be between 8 and 128 characters',

    FIRST_NAME_REQUIRED: 'First name is required',
    FIRST_NAME_MIN_LENGTH: 'First name must be at least 2 characters',
    FIRST_NAME_INVALID: 'First name must start with a letter and contain only letters, dots, quotes, and hyphens',

    LAST_NAME_REQUIRED: 'Last name is required',
    LAST_NAME_INVALID: 'Last name must start with a letter and contain only letters, spaces, dots, quotes, and hyphens',

    MOBILE_NUMBER_INVALID: 'Mobile number must be exactly 10 digits',
    COUNTRY_CODE_REQUIRED: 'Country code is required',
    GENDER_REQUIRED: 'Gender is required',

    LOGIN_CREDENTIALS_REQUIRED: 'Email or Mobile Number is required',
    OTP_REQUIRED: 'Verification code is required',
  },

  TASK: {
    TITLE_REQUIRED: 'Please enter a task title.',
    TITLE_EMPTY: 'Please enter a task title.',
    TITLE_TOO_LONG: 'Please keep the task title under 150 characters.',

    DESCRIPTION_REQUIRED: 'Please enter a task description.',
    DESCRIPTION_EMPTY: 'Please enter a task description.',
    DESCRIPTION_TOO_LONG: 'Please keep the task description under 500 characters.',

    STATUS_INVALID: (statusValues: string[]) => `Please select a valid task status from: ${statusValues.join(', ')}.`,
    PRIORITY_INVALID: (priorityValues: string[]) => `Please select a valid task priority from: ${priorityValues.join(', ')}.`,

    DUE_DATE_REQUIRED: 'Please select a due date.',
    DUE_DATE_INVALID: 'Please select a valid due date.',

    ASSIGNED_TO_REQUIRED: 'Please assign this task to an employee.',
    ASSIGNED_TO_INVALID: 'Please select a valid employee for task assignment.',
  },
};
