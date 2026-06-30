import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  profile,
  verifyOtp,
  resendVerificationOtp,
  resendResetOtp,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/authController';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validators/authValidator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/resend-reset-otp', resendResetOtp);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);
router.get('/profile', authenticate, profile);
router.get('/users', authenticate, getAllUsers);
router.put('/users/:id', authenticate, updateUser);
router.delete('/users/:id', authenticate, deleteUser);

export default router;
