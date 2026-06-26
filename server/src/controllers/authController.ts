import { Request, Response } from 'express';
import User from '../models/User';
import { signToken } from '../utils/jwt';
import { sendVerificationOtp } from '../utils/mailer';
import { uploadToCloudinary } from '../utils/cloudinary';

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

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      profilePicture: profilePicUrl,
      isVerified: false,
      verificationOtp,
      verificationOtpExpires,
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

    return res.status(200).json({
      success: true,
      message: 'If this email is registered, password reset instructions have been sent.',
      data: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
      errors: [],
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  return res.status(501).json({
    success: false,
    message: 'Password reset flow not implemented yet.',
    errors: [],
  });
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
        profilePicture: user.profilePicture,
      },
    },
  });
}
