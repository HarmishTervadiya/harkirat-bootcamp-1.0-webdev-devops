import { config } from "../../config";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  const token = authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json(new ApiResponse(false, {}, "BAD_REQUEST"));
  }

  const decodedToken: any = jwt.verify(token, config.JWT_SECRET!);

  if (!decodedToken) {
    return res
      .status(401)
      .json(new ApiResponse(false, {}, "INVALID_ACCESS_TOKEN"));
  }

  req.user = {
    id: decodedToken.id,
    name: decodedToken.name,
    role: decodedToken.role,
  };

  next();
});

export default verifyJwt;
