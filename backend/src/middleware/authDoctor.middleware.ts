import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const authDoctor = (req: Request, res: Response, next: NextFunction): void => {
  try {

    const tokenHeader =
      (req.headers["token"] as string)

    let token: string | null = null;

    if (tokenHeader) {
      token = tokenHeader;
    } 

    if (!token) {
      res.status(401).json(new ApiError(401, "Unauthorized: No token provided"));
      return;
    }
    

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (!decoded || decoded.role !== "doctor") {
      res.status(403).json(new ApiError(403, "Forbidden: Doctor access only"));
      return;
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("authDoctor error:", error.message);
    res.status(401).json(new ApiError(401, "Unauthorized: Invalid token"));
  }
};

export default authDoctor;
