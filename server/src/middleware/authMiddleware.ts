import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing or invalid',
        errors: [],
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const userId = decoded.id as string;
    if (!userId) {
      throw new Error('Invalid token payload');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        errors: [],
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
      errors: [],
    });
  }
}
