import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";
import { verifyJwt } from "../middlewares/auth.middleware";
import {
  roleValidator,
  validateRequestBody,
} from "../middlewares/validation.middleware";
import { createBookingSchema } from "../zod/request.validation";
import {
  cancelBooking,
  createBooking,
  getUserBookings,
} from "../controllers/booking.controller";
const router = Router();

router
  .route("/")
  .get(verifyJwt, getUserBookings)
  .post(
    verifyJwt,
    validateRequestBody(createBookingSchema),
    roleValidator(["customer", "owner"]),
    createBooking,
  );

router.put(
  "/:bookingId/cancel",
  verifyJwt,
  roleValidator(["customer", "owner"]),
  cancelBooking,
);

export default router;
