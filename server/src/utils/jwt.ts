import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Naya security token banana (Ye tab hota hai jab user login karta hai)
export function signToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

// Client (Frontend) se aaye hue token ko verify/check karna ki ye asli hai ya nahi
export function verifyToken(token: string): Record<string, unknown> {
  return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
}
