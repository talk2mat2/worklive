import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";

const JWT_SECRET = process.env.JWT_SECRET || "emeka1234";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    type: "user" | "vendor";
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json(genericResponse(null, responseCodes["401"], "Not Authorized"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user: AuthRequest["user"] };
    req.user = decoded.user;
    next();
  } catch {
    return res
      .status(401)
      .json(genericResponse(null, responseCodes["401"], "Invalid or expired token"));
  }
};

export const requireVendor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.type !== "vendor") {
    return res
      .status(403)
      .json(genericResponse(null, 403, "Only vendors can perform this action"));
  }
  next();
};
