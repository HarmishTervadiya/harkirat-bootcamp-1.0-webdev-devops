import { asyncHandler } from "../utils/asyncHandler";
import * as z from "zod";
import { LoginSchema, SignupSchema } from "../zod/request.validation";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";
import { prisma } from "../lib/prisma";
import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";

export const signUp = asyncHandler(async (req, res) => {
  const { success, data, error } = z.safeParse(SignupSchema, req.body);
  if (!success) {
    console.log(error);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: data.email },
  });

  if (existingUser) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "EMAIL_ALREADY_EXISTS"));
  }

  const hasedPassword = await brcypt.hash(data.password, 10);
  if (!hasedPassword) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_ERROR"));
  }

  // const role = data.role == "owner" ? data.role : "customer";
  const insertedUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hasedPassword,
      createdAt: new Date(),
      role: data.role,
      updatedAt: new Date(),
    },
  });

  if (!insertedUser) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_ERROR"));
  }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(
      true,
      {
        id: insertedUser.id,
        name: insertedUser.name,
        email: insertedUser.email,
        role: insertedUser.role,
      },
      null,
    ),
  );
});

export const login = asyncHandler(async (req, res) => {
  const { success, data } = z.safeParse(LoginSchema, req.body);

  if (!success) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const user = await prisma.user.findFirst({ where: { email: data.email } });
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(new ApiResponse(false, null, "INVALID_CREDENTIALS"));
  }

  const isPasswordCorrect = brcypt.compareSync(data.password, user.password);
  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(new ApiResponse(false, null, "INVALID_CREDENTIALS"));
  }

  // TODO: Replace with config variable in expriesIn
  const token = await jwt.sign(
    { id: user.id, role: user.role },
    config.JWT_SECRET!,
    { expiresIn: "1d" },
  );
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(new ApiResponse(false, null, "INVALID_CREDENTIALS"));
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      null,
    ),
  );
});
