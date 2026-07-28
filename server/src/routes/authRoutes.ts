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
  getArchivedUsers,
  restoreUser,
  requestLoginOtp,
  loginWithOtp,
  verifyResetOtp,
  permanentDeleteUser,
} from '../controllers/authController';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validators/authValidator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Naya user banane ka route (Registration)
router.post('/register', registerValidation, validateRequest, register);
// Normal email aur password se login
router.post('/login', loginValidation, validateRequest, login);
// Account verify karne ke liye OTP submit karna
router.post('/verify-otp', verifyOtp);
// OTP wapas mangwane ke routes
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/resend-reset-otp', resendResetOtp);
// Password bhool jane par OTP mangwana
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
// Naya password set karna
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);
// Bina password ke login karne ke liye OTP mangwana aur verify karna
router.post('/request-login-otp', requestLoginOtp);
router.post('/login-with-otp', loginWithOtp);
router.post('/verify-reset-otp', verifyResetOtp);

// Profile fetch karna (Iske liye 'authenticate' middleware zaroori hai, matlab login hona lazmi hai)
router.get('/profile', authenticate, profile);
// Users ki details nikalna, update karna, ya delete karna
router.get('/users/archived', authenticate, getArchivedUsers);
router.get('/users', authenticate, getAllUsers);
router.put('/users/:id', authenticate, updateUser);
router.delete('/users/:id', authenticate, deleteUser);
router.put('/users/:id/restore', authenticate, restoreUser);
router.delete('/users/:id/permanent', authenticate, permanentDeleteUser);

export default router;
