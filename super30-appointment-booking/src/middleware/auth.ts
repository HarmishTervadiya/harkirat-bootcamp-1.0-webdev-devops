import type { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../utils/types";
import type { Role } from "../../generated/prisma/enums";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export const roleCheck = (allowedRole: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req?.user) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    if (req.user?.role !== allowedRole) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }

    next();
  };
};
