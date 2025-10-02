import { Request } from 'express';
import { TokenPayload } from '../config/jwt';

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { role?: string; name?: string; email?: string };
    }
  }
}

export {};

// Extend Express Request to include file
export interface FileRequest extends Request {
    file?: Express.Multer.File;
    user?: TokenPayload;
}

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
    user: TokenPayload;
}

// Combined interface for authenticated requests with files
export interface AuthFileRequest extends AuthRequest {
    file?: Express.Multer.File;
}