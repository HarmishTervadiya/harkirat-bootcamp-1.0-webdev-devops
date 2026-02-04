import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";
import { verifyJwt } from "../middlewares/auth.middleware";
import {
  roleValidator,
  validateRequestBody,
} from "../middlewares/validation.middleware";
import { createHotelSchema } from "../zod/request.validation";
import { createHotel } from "../controllers/hotel.controller";

const router = Router();

router.post(
  "/",
  verifyJwt,
  validateRequestBody(createHotelSchema),
  roleValidator(["owner"]),
  createHotel,
);

export default router;
