import { config } from "../../config";
import { sql } from "../db";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

const signUpUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password, role].some((field) => !field)) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  if (role != "creator" && role != "contestee") {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const existingUser = await sql`select email from users where email=${email}`;
  if (existingUser.length > 0) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "EMAIL_ALREADY_EXISTS"));
  }

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 5,
  });

  const user = await sql`
    Insert into users (name, email, password, role) 
    values (${name}, ${email}, ${hashedPassword}, ${role}) 
    RETURNING *
  `;

  if (!user || user.length === 0) {
    return res
      .status(500)
      .json(new ApiResponse(false, null, "Failed to sign up the user"));
  }

  const userData = user[0];
  if (!userData) {
    return res
      .status(500)
      .json(new ApiResponse(false, null, "Failed to sign up the user"));
  }

  return res.status(201).json(
    new ApiResponse(
      true,
      {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
      null,
    ),
  );
});

const signInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const user = await sql`select * from users where email=${email}`;
  if (user.length > 0 && !user[0]) {
    return res
      .status(401)
      .json(new ApiResponse(false, null, "INVALID_CREDENTIALS"));
  }

  const isPasswordCorrect = Bun.password.verifySync(
    password,
    user[0]?.password,
    "bcrypt",
  );

  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json(new ApiResponse(false, null, "INVALID_CREDENTIALS"));
  }

  const payload = {
    id: user[0]?.id,
    name: user[0]?.name,
    role: user[0]?.role,
  };

  const expiresIn = (config.JWT_EXPIRY || "1d") as jwt.SignOptions["expiresIn"];
  const accessToken = jwt.sign(payload, config.JWT_SECRET!, {
    expiresIn,
  });

  return res
    .status(200)
    .json(new ApiResponse(true, { token: accessToken }, null));
});

export { signUpUser, signInUser };
