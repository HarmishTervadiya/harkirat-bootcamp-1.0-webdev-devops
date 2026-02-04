import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";
import { verifyJwt } from "../middlewares/auth.middleware";
import {
  roleValidator,
  validateRequestBody,
} from "../middlewares/validation.middleware";
import {
  addHotelRoomSchema,
  createHotelSchema,
} from "../zod/request.validation";
import {
  addHotelRoom,
  createHotel,
  getHotelDetails,
  getHotels,
} from "../controllers/hotel.controller";

const router = Router();

router
  .route("/")
  .get(verifyJwt, getHotels)
  .post(
    verifyJwt,
    validateRequestBody(createHotelSchema),
    roleValidator(["owner"]),
    createHotel,
  );

router.get("/:hotelId", verifyJwt, getHotelDetails);

router.post(
  "/:hotelId/rooms",
  verifyJwt,
  validateRequestBody(addHotelRoomSchema),
  roleValidator(["owner"]),
  addHotelRoom,
);

export default router;
