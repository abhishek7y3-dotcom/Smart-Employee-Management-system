import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  profile,
  verifyOtp,
} from '../controllers/authController';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validators/authValidator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);
router.get('/profile', authenticate, profile);

export default router;
