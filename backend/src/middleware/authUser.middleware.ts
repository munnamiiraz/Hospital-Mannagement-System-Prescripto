import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface Request {
      user?: any; // replace 'any' with a more specific type
    }
  }
}


const authUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const tokenHeader: string | undefined = (req.headers['token']) as string;
    let token: string | null = null;

    if (tokenHeader) {
      token = tokenHeader;
    } 

    if (!token) {
      res.status(401).json(new ApiError(401, "Unauthorized: No token provided"));
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("Decoded token from authUser:", decoded);

    if (!decoded) {
      res.status(401).json(new ApiError(401, "Unauthorized: Invalid token"));
      return;
    }

    req.user = decoded; // important to know
    next();
  } catch (error: any) {
    console.error("authUser error:", error.message);
    res.status(401).json(new ApiError(401, "Unauthorized: Invalid token"));
    return;
  }
};

export default authUser;