import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { NextFunction, Request, Response } from "express";

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(new ApiResponse(false, null, "UNAUTHORIZED"));
    }

    const decodedToken: any = jwt.verify(token, config.JWT_SECRET!);

    const { id, role } = decodedToken;

    if (!id || !role) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(new ApiResponse(false, null, "UNAUTHORIZED"));
    }

    req.user = {
      id,
      role,
    };
    next();
  } catch (error: any) {
    console.log("Access Token Error", error.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(new ApiResponse(false, null, "UNAUTHORIZED"));
  }
};
