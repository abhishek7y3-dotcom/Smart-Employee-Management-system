import { Request, Response } from 'express';
import User from '../models/User';
import { signToken } from '../utils/jwt';
import { sendVerificationOtp, sendResetPasswordOtp } from '../utils/mailer';
import { uploadToCloudinary } from '../utils/cloudinary';
import { AuthRequest } from '../middleware/authMiddleware';

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

    // Generate 6-Digit OTP Code
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const role = email.toLowerCase().startsWith('admin') ? 'admin' : 'user';
    const designation = role === 'admin' ? 'Admin' : 'Employee';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      profilePicture: profilePicUrl,
      isVerified: false,
      verificationOtp,
      verificationOtpExpires,
      role,
      designation,
    });

    // Trigger Verification OTP Email
    await sendVerificationOtp(user.email, user.name, verificationOtp);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify using the 6-digit code sent to your email.',
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
        message: 'Invalid email or password.',
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
        message: 'Invalid email or password.',
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

    if (user.verificationOtp !== otp) {
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendResetPasswordOtp(user.email, user.name, otp);

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

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
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
