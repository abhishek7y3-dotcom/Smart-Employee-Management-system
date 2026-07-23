import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';

// TypeScript interface: Request object me 'user' ki field add karne ke liye
export interface AuthRequest extends Request {
  user?: IUser; // Taki controllers me req.user easily access ho sake
}

/**
 * Ye middleware check karta hai ki user logged in hai ya nahi.
 * Ye frontend se aane wale JWT token ko verify karta hai.
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Request ke headers se 'Authorization' token nikalna
    const authHeader = req.headers.authorization;
    
    // 2. Agar token nahi hai ya 'Bearer ' se start nahi hota, toh error dena
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing or invalid', // Token missing ka message
        errors: [],
      });
    }

    // 3. 'Bearer <token>' me se actual token ko alag karna
    const token = authHeader.split(' ')[1];
    
    // 4. Token ko verify karna aur usme se data (payload) nikalna
    const decoded = verifyToken(token);

    // 5. Payload me se user ki ID nikalna
    const userId = decoded.id as string;
    if (!userId) {
      throw new Error('Invalid token payload'); // Agar ID nahi mili toh error throw karna
    }

    // 6. Database me check karna ki is ID ka user exist karta hai ya nahi
    const user = await User.findById(userId).select('+password'); // User dhoondna aur uski details lena
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found', // Agar user delete ho gaya ho ya fake ID ho
        errors: [],
      });
    }

    // 7. Agar sab theek hai, toh user object ko Request me save kar dena
    req.user = user;
    
    // 8. Agle function (controller) ko call karna
    next();
  } catch (error) {
    // Agar token expire ho gaya ho ya galat ho, toh ye catch block chalega
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
      errors: [],
    });
  }
}
