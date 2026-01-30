import { config } from "../../config";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  const token = authorization?.split(" ")[1];
  if (!token) {
    console.log("auth.middleware --> Acces Token is empty");
    return res.status(401).json(new ApiResponse(false, null, "UNAUTHORIZED"));
  }

  const decodedToken: any = jwt.verify(token, config.JWT_SECRET!);

  if (!decodedToken) {
    console.log("auth.middleware --> Invalid acces token");
    return res.status(401).json(new ApiResponse(false, null, "UNAUTHORIZED"));
  }

  const { id, name, role } = decodedToken;
  if ([id, name, role].some((field) => !field)) {
    return res.status(401).json(new ApiResponse(false, null, "UNAUTHORIZED"));
  }

  req.user = {
    id: id,
    name: name,
    role: role,
  };

  next();
});

export default verifyJwt;
