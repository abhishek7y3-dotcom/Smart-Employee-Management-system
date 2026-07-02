import { Request, Response } from 'express';
import User from '../models/User';
import { signToken, verifyToken } from '../utils/jwt';
import { sendVerificationOtp, sendResetPasswordOtp } from '../utils/mailer';
import { uploadToCloudinary } from '../utils/cloudinary';
import { AuthRequest } from '../middleware/authMiddleware';
import { encrypt, decrypt } from '../utils/crypto';

export async function register(req: Request, res: Response) {
  const { name, email, password, profilePicture } = req.body as {
    name: string;
    email: string;
    password: string;
    profilePicture?: string;
  };

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.',
        errors: [],
      });
    }

    // Upload image to Cloudinary (falls back to placeholder if Cloudinary not config'd)
    const profilePicUrl = await uploadToCloudinary(profilePicture || '', name);

    // Check if the request is made by an Admin (who should automatically verify new users)
    let isCreatedByAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        const userId = decoded.id as string;
        if (userId) {
          const reqUser = await User.findById(userId);
          if (reqUser && (reqUser.role === 'admin' || reqUser.role === 'Admin' || reqUser.role === 'Project Manager')) {
            isCreatedByAdmin = true;
          }
        }
      } catch (err) {
        // ignore decoding errors, treat as standard user signup
      }
    }

    // Generate 6-Digit OTP Code
    const verificationOtpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const role = email.toLowerCase().startsWith('admin') ? 'admin' : 'user';
    const designation = role === 'admin' ? 'Admin' : 'Employee';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      profilePicture: profilePicUrl,
      isVerified: isCreatedByAdmin, // verified automatically if created by admin
      verificationOtp: isCreatedByAdmin ? undefined : encrypt(verificationOtpPlain),
      verificationOtpExpires: isCreatedByAdmin ? undefined : verificationOtpExpires,
      role,
      designation,
    });

    if (!isCreatedByAdmin) {
      // Log OTP to terminal for development/testing
      console.log(`\n🔑 [REGISTER] Verification OTP for ${user.email}: ${verificationOtpPlain} (expires in 10 min)\n`);

      // Trigger Verification OTP Email (fire-and-forget; don't block registration on email failure)
      sendVerificationOtp(user.email, user.name, verificationOtpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to send verification OTP email:', emailErr);
      });
    }

    return res.status(201).json({
      success: true,
      message: isCreatedByAdmin
        ? 'Employee registered successfully!'
        : 'Registration successful! Please verify using the 6-digit code sent to your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('authController.ts: Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
      errors: [],
    });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email address not registered.',
        errors: [],
      });
    }

    // Check email verification status
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your email address is not verified yet. Please check your inbox for the verification code.',
        errors: [],
      });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.',
        errors: [],
      });
    }

    const token = signToken({ id: user._id, email: user.email });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
        token,
      },
    });
  } catch (error) {
    console.error('authController.ts: Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
      errors: [],
    });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email: string; otp: string };

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP code are required.',
    });
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+verificationOtp +verificationOtpExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified.',
      });
    }

    // Decrypt the stored OTP and compare with what the user submitted
    let storedOtp: string;
    try {
      storedOtp = decrypt(user.verificationOtp!);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Verification code is invalid or corrupted. Please register again.',
      });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
      });
    }

    if (user.verificationOtpExpires && user.verificationOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please register again or request a new OTP.',
      });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('authController.ts: OTP Verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification. Please try again.',
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email: string };

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email.',
        errors: [],
      });
    }

    // Generate 6-digit OTP code for password reset
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = encrypt(otpPlain); // stored encrypted
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [FORGOT PASSWORD] Reset OTP for ${user.email}: ${otpPlain} (expires in 10 min)\n`);

    // Fire-and-forget: don't block the response on email delivery
    sendResetPasswordOtp(user.email, user.name, otpPlain).catch((emailErr) => {
      console.error('authController.ts: Failed to send reset password OTP email:', emailErr);
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: forgotPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
      errors: [],
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { email, otp, password } = req.body as {
    email: string;
    otp: string;
    password?: string;
  };

  if (!email || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email, OTP code, and new password are required.',
      errors: [],
    });
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+resetPasswordOtp +resetPasswordOtpExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'No reset code found. Please request a new one.',
        errors: [],
      });
    }

    // Decrypt the stored OTP and compare with what the user submitted
    let storedResetOtp: string;
    try {
      storedResetOtp = decrypt(user.resetPasswordOtp);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Reset code is invalid or corrupted. Please request a new one.',
        errors: [],
      });
    }

    if (storedResetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
        errors: [],
      });
    }

    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new OTP.',
        errors: [],
      });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: resetPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during password reset. Please try again.',
      errors: [],
    });
  }
}

export async function resendVerificationOtp(req: Request, res: Response) {
  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.',
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+verificationOtp +verificationOtpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified. You can log in.',
      });
    }

    // Rate limit: prevent resend if last OTP was generated less than 60 seconds ago
    if (user.verificationOtpExpires && user.verificationOtpExpires.getTime() > Date.now() - 9 * 60 * 1000) {
      // OTP was created less than 1 minute ago (10min - 9min = 1min)
      const secondsLeft = Math.ceil((user.verificationOtpExpires.getTime() - (Date.now() - 9 * 60 * 1000)) / 1000);
      if (secondsLeft > 540) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft - 540} seconds before requesting a new code.`,
        });
      }
    }

    // Generate new 6-digit OTP
    const verificationOtpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationOtp = encrypt(verificationOtpPlain);
    user.verificationOtpExpires = verificationOtpExpires;
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [RESEND VERIFY] Verification OTP for ${user.email}: ${verificationOtpPlain} (expires in 10 min)\n`);

    // Send the new OTP via email (fire-and-forget)
    sendVerificationOtp(user.email, user.name, verificationOtpPlain).catch((emailErr) => {
      console.error('authController.ts: Failed to resend verification OTP email:', emailErr);
    });

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('authController.ts: resendVerificationOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
}

export async function resendResetOtp(req: Request, res: Response) {
  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.',
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOtp +resetPasswordOtpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email.',
      });
    }

    // Rate limit: prevent resend if last OTP was generated less than 60 seconds ago
    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires.getTime() > Date.now() - 9 * 60 * 1000) {
      const secondsLeft = Math.ceil((user.resetPasswordOtpExpires.getTime() - (Date.now() - 9 * 60 * 1000)) / 1000);
      if (secondsLeft > 540) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft - 540} seconds before requesting a new code.`,
        });
      }
    }

    // Generate new 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = encrypt(otpPlain);
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [RESEND RESET] Reset OTP for ${user.email}: ${otpPlain} (expires in 10 min)\n`);

    // Send the new OTP via email (fire-and-forget)
    sendResetPasswordOtp(user.email, user.name, otpPlain).catch((emailErr) => {
      console.error('authController.ts: Failed to resend reset OTP email:', emailErr);
    });

    return res.status(200).json({
      success: true,
      message: 'A new password reset code has been sent to your email.',
    });
  } catch (error) {
    console.error('authController.ts: resendResetOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
}

export async function requestLoginOtp(req: Request, res: Response) {
  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email.' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Your email is not verified yet. Please verify your account first.' });
    }

    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.loginOtp = encrypt(otpPlain);
    user.loginOtpExpires = otpExpires;
    await user.save();

    console.log(`\n🔑 [LOGIN OTP] OTP for ${user.email}: ${otpPlain} (expires in 10 min)\n`);

    sendVerificationOtp(user.email, user.name, otpPlain).catch((err) => {
      console.error('authController.ts: Failed to send login OTP email:', err);
    });

    return res.status(200).json({
      success: true,
      message: 'A login code has been sent to your email.',
    });
  } catch (error) {
    console.error('authController.ts: requestLoginOtp error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
}

export async function loginWithOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email: string; otp: string };

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+loginOtp +loginOtpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email.' });
    }
    if (!user.loginOtp) {
      return res.status(400).json({ success: false, message: 'No login code found. Please request a new one.' });
    }

    let storedOtp: string;
    try {
      storedOtp = decrypt(user.loginOtp);
    } catch {
      return res.status(400).json({ success: false, message: 'Login code is invalid or corrupted. Please request a new one.' });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid login code.' });
    }
    if (user.loginOtpExpires && user.loginOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Login code has expired. Please request a new one.' });
    }

    // Clear OTP after successful verification
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    const token = signToken({ id: user._id, email: user.email });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
        token,
      },
    });
  } catch (error) {
    console.error('authController.ts: loginWithOtp error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
}

export async function profile(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation || 'Employee',
        profilePicture: user.profilePicture,
      },
    },
  });
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find({}, 'name email role designation profilePicture isVerified');
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: { users },
    });
  } catch (error) {
    console.error('authController.ts: getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users.',
      errors: [],
    });
  }
}

export async function updateUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const { role, designation } = req.body as { role?: string; designation?: string };
  const { id } = req.params;

  try {
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only administrators can perform this action.',
        errors: [],
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    // An admin's designation cannot be changed by other users other than the admin itself.
    if (user.role === 'admin' && user._id.toString() !== authReq.user?._id.toString() && designation !== undefined) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. An administrator's designation can only be updated by themselves.",
        errors: [],
      });
    }

    if (role) {
      user.role = role as 'user' | 'admin';
    }
    if (designation !== undefined) {
      user.designation = designation;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          designation: user.designation,
          profilePicture: user.profilePicture,
        }
      },
    });
  } catch (error) {
    console.error('authController.ts: updateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating user.',
      errors: [],
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  try {
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only administrators can remove users.',
        errors: [],
      });
    }

    if (authReq.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin account.',
        errors: [],
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User removed successfully.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: deleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while removing the user.',
      errors: [],
    });
  }
}
