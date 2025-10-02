import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface Request {
      admin?: any; // replace 'any' with a more specific type
    }
  }
}


const authAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const tokenHeader: string | undefined = (req.headers['token'] || req.headers['x-access-token'] || req.headers['atoken']) as string;
    let token: string | null = null;

    if (tokenHeader) {
      token = tokenHeader;
    } 

    if (!token) {
      res.status(401).json(new ApiError(401, "Unauthorized: No token provided"));
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded) {
      res.status(401).json(new ApiError(401, "Unauthorized: Invalid token"));
      return;
    }

    req.admin = decoded;
    next();
  } catch (error: any) {
    console.error("authAdmin error:", error.message);
    res.status(401).json(new ApiError(401, "Unauthorized: Invalid token"));
    return;
  }
};

export default authAdmin;