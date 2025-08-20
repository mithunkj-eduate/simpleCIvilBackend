import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "./loggerInfo";
import CustomError from "../Utils/CustomError";

// Extend Express Request to add user property
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  console.log("verifyjwt:19 entered verify token");

  const secretKey = process.env.TOKEN_SECRET; // Correct env var name

  if (!secretKey) {
    // Fail fast if secret key missing
    throw new Error("JWT SECRET not defined in environment variables");
  }

  const authHeader = req.headers["authorization"];
  console.log("verifyjwt:29 authHeader",authHeader);

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header not found" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res
      .status(401)
      .json({ message: "Token not found in authorization header" });
    return;
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      logger.error(err);
      return next(new CustomError("Unauthorized: Invalid token", 401));
    }

    // decoded is either string or JwtPayload; we expect JwtPayload here
    const payload = decoded as JwtPayload & { userId?: string; role?: string };

    if (!payload.userId || !payload.role) {
      return next(new CustomError("Unauthorized: Invalid token payload", 401));
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  });
};

export default verifyToken;
