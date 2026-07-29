import { Request, Response } from 'express';
import User from '../models/User';
import { signToken, verifyToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationOtp, sendResetPasswordOtp, sendAdminAccountCreationEmail, sendAccountDeactivationEmail, sendAccountReactivationEmail, sendAccountPermanentDeletionEmail } from '../utils/mailer';
import { sendSmsOtp } from '../utils/twilio';
import { uploadToCloudinary, uploadDocumentToCloudinary } from '../utils/cloudinary';
import { AuthRequest } from '../middleware/authMiddleware';
import { encrypt, decrypt } from '../utils/crypto';
import { sanitizePhoneNumber, validatePhoneNumber } from '../utils/phoneValidation';

/**
 * @description Registers a new user in the system.
 * @logic
 * - Extracts personal details and credentials from the payload.
 * - Performs a MongoDB lookup to ensure the email or mobile number isn't already taken (Conflict Prevention).
 * - Hashes the password (handled automatically via the Mongoose pre-save hook in `User.ts`).
 * - Uploads the profile picture to Cloudinary if provided.
 * - Generates a 6-digit OTP for email verification and sends it via Nodemailer.
 */
export async function register(req: Request, res: Response) {
  const { name, email, password, profilePicture, firstName, lastName, gender, qualification, mobileNumber, countryCode } = req.body as {
    name: string;
    email: string;
    password: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    qualification?: string;
    mobileNumber?: string;
    countryCode?: string;
  };

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { mobileNumber }]
    });
    if (existingUser) {
      if (existingUser.isVerified) {
        if (existingUser.email === email.toLowerCase()) {
          return res.status(409).json({
            success: false,
            message: 'Email is already registered.',
            errors: [],
          });
        }
        if (existingUser.mobileNumber === mobileNumber) {
          return res.status(409).json({
            success: false,
            message: 'Mobile number is already registered.',
            errors: [],
          });
        }
      } else {
        // User exists but is NOT verified. Delete the unverified record so they can register again.
        await User.findByIdAndDelete(existingUser._id);
      }
    }

    // Upload image to Cloudinary (falls back to placeholder if Cloudinary not config'd)
    const computedName = `${firstName || ''} ${lastName || ''}`.trim() || name;
    const profilePicUrl = await uploadToCloudinary(profilePicture || '', computedName);

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
          if (reqUser && (reqUser.role === 'admin' || reqUser.designation === 'Admin' || reqUser.designation === 'Project Manager')) {
            isCreatedByAdmin = true;
          }
        }
      } catch (err) {
        // ignore decoding errors, treat as standard user signup
      }
    }

    // Generate 6-Digit OTP Code
    const verificationOtpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes (lower from 10 min to 2 min)

    const role = email.toLowerCase().startsWith('admin') ? 'admin' : 'member';
    const designation = role === 'admin' ? 'CEO' : 'Employee';

    const user = await User.create({
      name: computedName,
      firstName,
      lastName,
      gender,
      qualification,
      mobileNumber,
      countryCode,
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
      console.log(`\n🔑 [REGISTER] Verification OTP for ${user.email}: ${verificationOtpPlain} (expires in 2 min)\n`);

      // Trigger Verification OTP Email (fire-and-forget; don't block registration on email failure)
      sendVerificationOtp(user.email, user.name, verificationOtpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to send verification OTP email:', emailErr);
      });
      // Trigger Verification SMS (fire-and-forget)
      if (user.mobileNumber) {
        sendSmsOtp(user.countryCode || '', user.mobileNumber, verificationOtpPlain, 'Registration').catch((smsErr) => {
          console.error('authController.ts: Failed to send SMS:', smsErr);
        });
      }
    } else {
      // Trigger Admin Account Creation Email
      sendAdminAccountCreationEmail(user.email, user.name, password).catch((emailErr) => {
        console.error('authController.ts: Failed to send admin account creation email:', emailErr);
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
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
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

// =========================================================================
// INTERVIEW GUIDE: login() Controller (The Brain)
// Yeh function actual logic run karta hai. 
// Pipeline: Request -> authRoutes.ts -> Validation Middleware -> Yahan (Controller)
// =========================================================================
export async function login(req: Request, res: Response) {
  // 1. Data Extractor: Frontend se aaye data ko nikalna
  const { email, password, mobileNumber, countryCode } = req.body as { email?: string; password: string; mobileNumber?: string; countryCode?: string };

  try {
    let user;
    // 2. Database Lookup: Email ya Mobile kisi ek cheez se user dhoondhna
    // Interview Note: Yahan `select('+password')` isliye likha hai kyunki Model me humne 
    // `select: false` kiya tha (Security). Toh verify karne ke liye explicitly bulana padta hai.
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (mobileNumber) {
      user = await User.findOne({ mobileNumber, countryCode }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with these credentials.',
        errors: [],
      });
    }

    if (user.isArchived) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by an administrator.',
        errors: [],
      });
    }

    // Check email verification status
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not verified yet. Please check your inbox for the verification code.',
        errors: [],
      });
    }

    // 3. Password Verification
    // Database me password encrypted (hash) hai aur user ne plain text bheja hai.
    // Hum 'comparePassword' method (jo User.ts me banaya tha) use karke match karte hain.
    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.',
        errors: [],
      });
    }

    // 4. Token Generation (JWT)
    const token = signToken({ id: user._id, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id, email: user.email });

    // 5. Update Record
    user.lastLogin = new Date();
    
    // Save refresh token to user
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    // Keep max 5 active sessions
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }

    await user.save({ validateBeforeSave: false });

    // 6. HttpOnly Cookie Set Karna
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          qualification: user.qualification,
          country: user.country,
          permanentAddress: user.permanentAddress,
          currentAddress: user.currentAddress,
          alternateNumber: user.alternateNumber,
          state: user.state,
          district: user.district,
          documents: user.documents,
          termsAndConditions: user.termsAndConditions,
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
  const { email, mobileNumber, countryCode } = req.body as { email?: string; mobileNumber?: string; countryCode?: string };

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobileNumber) {
      user = await User.findOne({ mobileNumber, countryCode });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with these credentials.',
        errors: [],
      });
    }

    if (user.isArchived) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by an administrator.',
        errors: [],
      });
    }

    // Generate 6-digit OTP code for password reset
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = encrypt(otpPlain); // stored encrypted
    user.resetPasswordOtpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [FORGOT PASSWORD] Reset OTP for ${user.email}: ${otpPlain} (expires in 2 min)\n`);

    if (email) {
      // Send only to email
      sendResetPasswordOtp(user.email, user.name, otpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to send reset password OTP email:', emailErr);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send only to mobile
      sendSmsOtp(user.countryCode || '', user.mobileNumber, otpPlain, 'Password Reset').catch((smsErr) => {
        console.error('authController.ts: Failed to send reset SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'Password reset OTP has been sent to your mobile number.' : 'Password reset OTP has been sent to your email.',
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
  const { email, mobileNumber, countryCode, otp, password } = req.body as {
    email?: string;
    mobileNumber?: string;
    countryCode?: string;
    otp: string;
    password?: string;
  };

  if ((!email && !mobileNumber) || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/Phone, OTP code, and new password are required.',
      errors: [],
    });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({
        email: email.toLowerCase(),
      }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    } else if (mobileNumber) {
      user = await User.findOne({
        mobileNumber,
        countryCode,
      }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    }

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
  const { email, mobileNumber } = req.body as { email?: string; mobileNumber?: string };

  if (!email && !mobileNumber) {
    return res.status(400).json({
      success: false,
      message: 'Email or Mobile Number is required.',
    });
  }

  try {
    const query = email ? { email: email.toLowerCase() } : { mobileNumber };
    const user = await User.findOne(query).select('+verificationOtp +verificationOtpExpires');

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
    if (user.verificationOtpExpires && user.verificationOtpExpires.getTime() > Date.now() + 1 * 60 * 1000) {
      const secondsLeft = Math.ceil((user.verificationOtpExpires.getTime() - (Date.now() + 1 * 60 * 1000)) / 1000);
      if (secondsLeft > 0) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting a new code.`,
        });
      }
    }

    // Generate new 6-digit OTP
    const verificationOtpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.verificationOtp = encrypt(verificationOtpPlain);
    user.verificationOtpExpires = verificationOtpExpires;
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [RESEND VERIFY] Verification OTP for ${user.email}: ${verificationOtpPlain} (expires in 2 min)\n`);

    if (email) {
      // Send the new OTP via email (fire-and-forget)
      sendVerificationOtp(user.email, user.name, verificationOtpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to resend verification OTP email:', emailErr);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send SMS (fire-and-forget)
      sendSmsOtp(user.countryCode || '', user.mobileNumber, verificationOtpPlain, 'Verification').catch((smsErr) => {
        console.error('authController.ts: Failed to resend verification SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'A new verification code has been sent to your mobile number.' : 'A new verification code has been sent to your email.',
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
  const { email, mobileNumber, countryCode } = req.body as { email?: string; mobileNumber?: string; countryCode?: string };

  if (!email && !mobileNumber) {
    return res.status(400).json({
      success: false,
      message: 'Email or Mobile Number is required.',
    });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    } else if (mobileNumber) {
      user = await User.findOne({ mobileNumber, countryCode }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with these credentials.',
      });
    }

    // Rate limit: prevent resend if last OTP was generated less than 60 seconds ago
    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires.getTime() > Date.now() + 1 * 60 * 1000) {
      const secondsLeft = Math.ceil((user.resetPasswordOtpExpires.getTime() - (Date.now() + 1 * 60 * 1000)) / 1000);
      if (secondsLeft > 0) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting a new code.`,
        });
      }
    }

    // Generate new 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = encrypt(otpPlain);
    user.resetPasswordOtpExpires = new Date(Date.now() + 2 * 60 * 1000);
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [RESEND RESET] Reset OTP for ${user.email}: ${otpPlain} (expires in 2 min)\n`);

    if (email) {
      // Send only to email
      sendResetPasswordOtp(user.email, user.name, otpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to resend reset OTP email:', emailErr);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send only to mobile
      sendSmsOtp(user.countryCode || '', user.mobileNumber, otpPlain, 'Password Reset').catch((smsErr) => {
        console.error('authController.ts: Failed to resend reset SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'A new password reset code has been sent to your mobile number.' : 'A new password reset code has been sent to your email.',
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
  const { email, mobileNumber, countryCode } = req.body as { email?: string; mobileNumber?: string; countryCode?: string };

  if (!email && !mobileNumber) {
    return res.status(400).json({ success: false, message: 'Email or Mobile Number is required.' });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobileNumber) {
      user = await User.findOne({ mobileNumber, countryCode });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with these credentials.' });
    }
    
    if (user.isArchived) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated by an administrator.' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Your account is not verified yet. Please verify your account first.' });
    }

    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.loginOtp = encrypt(otpPlain);
    user.loginOtpExpires = otpExpires;
    await user.save();

    console.log(`\n🔑 [LOGIN OTP] OTP for ${user.email || user.mobileNumber}: ${otpPlain} (expires in 2 min)\n`);

    if (email) {
      sendVerificationOtp(user.email, user.name, otpPlain).catch((err) => {
        console.error('authController.ts: Failed to send login OTP email:', err);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send SMS (fire-and-forget)
      sendSmsOtp(user.countryCode || '', user.mobileNumber, otpPlain, 'Login').catch((smsErr) => {
        console.error('authController.ts: Failed to send login SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'A login code has been sent to your mobile number.' : 'A login code has been sent to your email.',
    });
  } catch (error) {
    console.error('authController.ts: requestLoginOtp error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
}

export async function loginWithOtp(req: Request, res: Response) {
  const { email, mobileNumber, countryCode, otp } = req.body as { email?: string; mobileNumber?: string; countryCode?: string; otp: string };

  if ((!email && !mobileNumber) || !otp) {
    return res.status(400).json({ success: false, message: 'Credentials and OTP code are required.' });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+loginOtp +loginOtpExpires');
    } else if (mobileNumber) {
      user = await User.findOne({ mobileNumber, countryCode }).select('+loginOtp +loginOtpExpires');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with these credentials.' });
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
    const refreshToken = signRefreshToken({ id: user._id, email: user.email });
    
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    await user.save({ validateBeforeSave: false });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          qualification: user.qualification,
          country: user.country,
          permanentAddress: user.permanentAddress,
          currentAddress: user.currentAddress,
          alternateNumber: user.alternateNumber,
          state: user.state,
          district: user.district,
          documents: user.documents,
          termsAndConditions: user.termsAndConditions,
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
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        mobileNumber: user.mobileNumber,
        countryCode: user.countryCode,
        email: user.email,
        role: user.role,
        designation: user.designation || 'Employee',
        profilePicture: user.profilePicture,
        qualification: user.qualification,
        country: user.country,
        permanentAddress: user.permanentAddress,
        currentAddress: user.currentAddress,
        alternateNumber: user.alternateNumber,
        state: user.state,
        district: user.district,
        documents: user.documents,
        termsAndConditions: user.termsAndConditions,
      },
    },
  });
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find({ isArchived: { $ne: true } }, 'name email role designation profilePicture isVerified firstName lastName mobileNumber');
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: { users },
    });
  } catch (error) {
    console.error('authController.ts: Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
    });
  }
}

export async function logout(req: Request, res: Response) {
  // If user is authenticated, remove this specific refresh token from DB
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken) as { id: string };
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: refreshToken }
      });
    } catch (err) {
      // Token is invalid or expired, ignore DB update
    }
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

export async function updateUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const { role, designation, name, profilePicture, firstName, lastName, gender, mobileNumber, countryCode, qualification, country, permanentAddress, currentAddress, alternateNumber, state, district, documents, termsAndConditions } = req.body as {
    role?: string;
    designation?: string;
    name?: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    mobileNumber?: string;
    countryCode?: string;
    qualification?: string;
    country?: string;
    permanentAddress?: string;
    currentAddress?: string;
    alternateNumber?: string;
    state?: string;
    district?: string;
    documents?: string[];
    termsAndConditions?: boolean;
  };
  const { id } = req.params;

  try {
    const isAdmin = authReq.user?.role === 'admin';
    const isSelf = authReq.user?._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this profile.',
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

    // Role and designation updates are reserved for admins
    if (role !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Only administrators can update user roles.',
          errors: [],
        });
      }
      // Frontend may still send 'employee' or 'user' for role, map it to 'member'
      const sanitizedRole = (role === 'employee' || role === 'user') ? 'member' : role;
      user.role = sanitizedRole as 'member' | 'admin';
    }

    if (designation !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Only administrators can update user designations.',
          errors: [],
        });
      }
      user.designation = designation;
    }

    if (firstName !== undefined) {
      user.firstName = firstName;
    }

    if (lastName !== undefined) {
      if (lastName.startsWith(' ')) {
        return res.status(400).json({
          success: false,
          message: 'Last name cannot start with a space.',
          errors: [],
        });
      }
      if (/\d/.test(lastName)) {
        return res.status(400).json({
          success: false,
          message: 'Last name cannot contain numbers.',
          errors: [],
        });
      }
      const nameRegex = /^[a-zA-Z][a-zA-Z.'\- ]*$/;
      if (!nameRegex.test(lastName)) {
        return res.status(400).json({
          success: false,
          message: 'Last name must start with a letter and contain only letters, spaces, dots, quotes, and hyphens.',
          errors: [],
        });
      }
      user.lastName = lastName;
    }

    if (gender !== undefined) {
      user.gender = gender;
    }

    if (mobileNumber !== undefined) {
      const sanitized = sanitizePhoneNumber(mobileNumber);
      if (sanitized) {
        const validation = validatePhoneNumber(sanitized);
        if (!validation.isValid) {
          return res.status(400).json({ success: false, message: `Mobile Number: ${validation.error}`, errors: [] });
        }
      }
      user.mobileNumber = sanitized;
    }

    if (countryCode !== undefined) {
      user.countryCode = countryCode;
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (qualification !== undefined) {
      user.qualification = qualification;
    }

    if (country !== undefined) {
      user.country = country;
    }

    if (permanentAddress !== undefined) {
      user.permanentAddress = permanentAddress;
    }

    if (currentAddress !== undefined) {
      user.currentAddress = currentAddress;
    }

    if (alternateNumber !== undefined) {
      const sanitizedAlt = sanitizePhoneNumber(alternateNumber);
      if (sanitizedAlt) {
        const validationAlt = validatePhoneNumber(sanitizedAlt);
        if (!validationAlt.isValid) {
          return res.status(400).json({ success: false, message: `Alternate Number: ${validationAlt.error}`, errors: [] });
        }
      }
      user.alternateNumber = sanitizedAlt;
    }

    if (state !== undefined) {
      user.state = state;
    }

    if (district !== undefined) {
      user.district = district;
    }

    if (documents !== undefined) {
      const resolvedDocuments = await Promise.all(documents.map(async (doc) => {
        if (doc.startsWith('data:')) {
          return await uploadDocumentToCloudinary(doc);
        }
        return doc;
      }));
      user.documents = resolvedDocuments.filter(Boolean);
    }

    if (termsAndConditions !== undefined) {
      user.termsAndConditions = termsAndConditions;
    }

    if (profilePicture !== undefined) {
      if (profilePicture.startsWith('data:image')) {
        const computedName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name;
        user.profilePicture = await uploadToCloudinary(profilePicture, computedName);
      } else {
        user.profilePicture = profilePicture;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role,
          designation: user.designation || 'Employee',
          profilePicture: user.profilePicture,
          qualification: user.qualification,
          country: user.country,
          permanentAddress: user.permanentAddress,
          currentAddress: user.currentAddress,
          alternateNumber: user.alternateNumber,
          state: user.state,
          district: user.district,
          documents: user.documents,
          termsAndConditions: user.termsAndConditions,
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
    const isAdmin = authReq.user?.role === 'admin';
    const isSelf = authReq.user?._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to perform this action.',
        errors: [],
      });
    }

    if (isAdmin && isSelf) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin account.',
        errors: [],
      });
    }

    const user = await User.findByIdAndUpdate(id, { isArchived: true }, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    sendAccountDeactivationEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send deactivation email to', user.email, err);
    });

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

export async function getArchivedUsers(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const users = await User.find({ isArchived: true }, 'name email role designation profilePicture isVerified firstName lastName mobileNumber');
    return res.status(200).json({
      success: true,
      message: 'Archived users retrieved successfully.',
      data: { users },
    });
  } catch (error) {
    console.error('authController.ts: getArchivedUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching archived users.',
      errors: [],
    });
  }
}

export async function restoreUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(id, { isArchived: false }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in archive.' });
    }

    sendAccountReactivationEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send reactivation email to', user.email, err);
    });

    return res.status(200).json({
      success: true,
      message: 'User restored successfully.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: restoreUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while restoring the user.',
      errors: [],
    });
  }
}

export async function verifyResetOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email: string; otp: string };
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP code are required.',
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.',
      });
    }

    let storedOtp = decrypt(user.resetPasswordOtp);
    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
      });
    }

    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    console.error('authController.ts: verifyResetOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification.',
    });
  }
}

export async function permanentDeleteUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    sendAccountPermanentDeletionEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send permanent deletion email to', user.email, err);
    });

    return res.status(200).json({
      success: true,
      message: 'User permanently deleted.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: permanentDeleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the user.',
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not found. Please log in again.'
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken) as { id: string };
    
    // Check if user exists and token is in their active sessions
    const user = await User.findById(decoded.id).select('+refreshTokens');
    
    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    // Generate new access token
    const newAccessToken = signToken({ id: user._id, email: user.email });

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: { token: newAccessToken }
    });

  } catch (error) {
    console.error('authController.ts: Refresh token error:', error);
    // If token verification fails (e.g., expired), we clear the cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(401).json({
      success: false,
      message: 'Refresh token expired or invalid.'
    });
  }
}
