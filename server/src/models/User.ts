import bcrypt from 'bcrypt';
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  mobileNumber?: string;
  countryCode?: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  isVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  loginOtp?: string;
  loginOtpExpires?: Date;
  designation?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
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
    mobileNumber: {
      type: String,
      trim: true,
      default: '',
    },
    countryCode: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    designation: {
      type: String,
      default: 'Employee',
    },
    profilePicture: {
      type: String,
      default: '',
    },
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
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>('save', async function save(next) {
  if (this.firstName || this.lastName) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'User';
  }

  if (!this.isModified('password')) {
    return next();
  }

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

const User = model<IUser>('User', userSchema);

export default User;
