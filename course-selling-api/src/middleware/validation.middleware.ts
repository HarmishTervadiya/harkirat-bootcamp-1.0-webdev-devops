import type { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const validateReqBody = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));

        return res
          .status(400)
          .json(new ApiError(errorMessages.toString(), 400));
      } else {
        return res.status(500).json(new ApiError("Internal server error", 500));
      }
    }
  };
};

type UserRole = "STUDENT" | "INSTRUCTOR";
export const roleValidator = (allowedRoles: UserRole[]) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(400).json(new ApiError("Bad Request", 400));
    }

    if (!allowedRoles.includes(req.user?.role as UserRole)) {
      return res.status(401).json(new ApiError("UNAUTHORIZED", 401));
    }

    next();
  });
};
