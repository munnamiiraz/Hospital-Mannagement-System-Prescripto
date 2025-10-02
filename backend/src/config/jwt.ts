import jwt from 'jsonwebtoken';
import type { JwtPayload, Secret } from 'jsonwebtoken';
import { IUser } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  avatar?: {
    url: string;
    publicId: string;
  };
}

export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };

  return jwt.sign(payload, JWT_SECRET as Secret, {
    expiresIn: 604800 // 7 days in seconds
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};