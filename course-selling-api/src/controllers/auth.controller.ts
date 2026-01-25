import { asyncHandler } from "../utils/asyncHandler";
import z from "zod";
import { LoginSchema, SignupSchema } from "../zod/requestSchema";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../../db";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { ApiResponse } from "../utils/ApiResponse";

export const signUp = asyncHandler(async (req, res) => {
  const validatation = z.safeParse(SignupSchema, req.body);

  if (validatation.error) {
    console.log("Sign up validation failed", validatation.error.message);
    return res.status(400).json(new ApiError("Invalid data", 400));
  }

  const { email, name, password, role } = validatation.data;
  const existingUser = await prisma.user.findFirst({ where: { email: email } });

  if (existingUser) {
    return res.status(400).json(new ApiError("Email already exists", 400));
  }

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
  });
  const newUser = await prisma.user.create({
    data: { email, name, password: hashedPassword, role },
  });

  if (!newUser) {
    return res.status(500).json(new ApiError("Internal server error", 500));
  }

  const accessToken = jwt.sign(
    { id: newUser.id, name: newUser.name, role: newUser.role },
    config.JWT_SECRET!,
  );

  if (!accessToken) {
    return res.status(500).json(new ApiError("Internal server error", 500));
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        { id: newUser.id, name: newUser.name, role: newUser.role, accessToken },
        "User created successfully",
      ),
    );
});

export const login = asyncHandler(async (req, res) => {
  const validatedData = z.safeParse(LoginSchema, req.body);

  if (validatedData.error) {
    console.log("Data validation failed for login", validatedData.error.message);
    return res.status(400).json(new ApiError("Invalid data", 400));
  }

  const user = await prisma.user.findUnique({
    where: { email: validatedData.data.email },
  });

  if (!user) {
    return res.status(400).json(new ApiError("User does not exists", 400));
  }

  const isPasswordCorrect = Bun.password.verifySync(
    validatedData.data.password,
    user.password,
  );
  if (!isPasswordCorrect) {
    return res.status(401).json(new ApiError("Incorrect password", 401));
  }

  const accessToken = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    config.JWT_SECRET!,
  );
  if (!accessToken) {
    return res.status(500).json(new ApiError("Internal server error", 500));
  }

  return res
    .status(200)
    .json(new ApiResponse(accessToken, "User logged in successfully"));
});
