import { config } from "../../config";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json(
        new ApiError("Access token is required", 401),
      );
  }

  const decodedToken: any = jwt.verify(token, config.JWT_SECRET!);
  if (!decodedToken) {
    return res
      .status(401)
      .json(new ApiError("Invalid access token", 401));
  }

  const { id, name, role } = decodedToken;
  if ([id, name, role].some((field) => !field)) {
    return res
      .status(401)
      .json(new ApiError("Invalid access token", 401));
  }

  req.user = {
    id: id,
    name: name,
    role: role,
  };

  next();
});
