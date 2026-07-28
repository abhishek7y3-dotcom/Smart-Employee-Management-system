import bcrypt from 'bcrypt';
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  qualification?: string;
  mobileNumber?: string;
  countryCode?: string;
  email: string;
  password: string;
  role: 'member' | 'admin';
  profilePicture?: string;
  isVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  loginOtp?: string;
  loginOtpExpires?: Date;
  designation?: string;
  department?: string;
  permanentAddress?: string;
  currentAddress?: string;
  country?: string;
  alternateNumber?: string;
  state?: string;
  district?: string;
  documents?: string[];
  termsAndConditions?: boolean;
  lastLogin?: Date;
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * @description The User Model defines the core authentication and identity schema for all members and admins.
 * @logic
 * - Enforces strong password constraints (min 8 chars) and automatically hashes passwords before saving via the `pre('save')` hook.
 * - Stores sensitive data (like `password`, `loginOtp`, `verificationOtp`) with `select: false` to ensure they are NEVER accidentally returned in an API payload.
 * - Uses specific indexes (`email`, `mobileNumber`) to ensure extremely fast O(1) or O(log n) lookups during Login.
 */
const userSchema = new Schema<IUser>(
  {
    // User ka mukammal naam (First Name + Last Name)
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      trim: true,
      default: '',
    },
    qualification: {
      type: String,
      trim: true,
      default: '',
    },
    // Employee ka unique mobile number
    mobileNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    countryCode: {
      type: String,
      trim: true,
      default: '',
    },
    // Email ID jo login ke kaam aayegi, ye hamesha unique hogi aur lowercase me save hogi
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    // User ka password, select: false ka matlab hai ki API response me ye field automatically nahi jayegi
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    // User ka role, by default har naya user 'member' (employee) banega
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    designation: {
      type: String,
      default: 'Employee',
    },
    department: {
      type: String,
      default: 'Unassigned',
    },
    permanentAddress: {
      type: String,
      trim: true,
      default: '',
    },
    currentAddress: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    alternateNumber: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    documents: [{
      type: String,
      trim: true,
    }],
    termsAndConditions: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    // OTP verification status, account create hone par by default false hota hai
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOtp: {
      type: String,
      select: false,
    },
    verificationOtpExpires: {
      type: Date,
      select: false,
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordOtpExpires: {
      type: Date,
      select: false,
    },
    loginOtp: {
      type: String,
      select: false,
    },
    loginOtpExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    isArchived: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

/**
 * @description Mongoose Middleware (Hook) that executes automatically right before a user is saved to the database.
 * @logic
 * - Handles automatic concatenation of `firstName` and `lastName` into a single `name` property.
 * - Checks if the `password` field was modified. If so, it generates a cryptographically secure salt using `bcrypt` and replaces the plaintext password with a hashed version.
 */
// Ye hook data database me save hone se theek pehle chalta hai
userSchema.pre<IUser>('save', async function save(next) {
  // 1. Agar user ne firstName aur lastName update kiya hai, toh dono ko jod kar 'name' bana dena
  if (this.firstName || this.lastName) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'User';
  }

  // 2. Agar password change nahi hua hai, toh seedha agle step par chale jao (bcrypt avoid karna)
  if (!this.isModified('password')) {
    return next();
  }

  // 3. Agar naya password diya gaya hai, toh usko encrypt (hash) karke save karna
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add indexes to optimize authentication flows
userSchema.index({ email: 1 });
userSchema.index({ mobileNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ email: 1, isVerified: 1 });

const User = model<IUser>('User', userSchema);

export default User;
