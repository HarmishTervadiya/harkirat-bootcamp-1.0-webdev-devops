import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";
import { ApiResponse } from "../utils/ApiResponse";
import type { UserRole } from "../../generated/prisma/enums";
import { asyncHandler } from "../utils/asyncHandler";

export const validateRequestBody = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      console.log("Invalid request body: ", errors);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(new ApiResponse(false, null, "INVALID_BODY_REQUEST"));
    }

    req.body = result.data;
    next();
  };
};

export const roleValidator = (allowedRoles: UserRole[]) =>
  asyncHandler(async (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role as UserRole)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(new ApiResponse(false, null, "FORBIDDEN"));
    }
    next();
  });
