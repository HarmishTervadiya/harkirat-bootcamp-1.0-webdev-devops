import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { getDBTimestamps } from "../utils/getDBTimestamps";

export const createHotel = asyncHandler(async (req, res) => {
  const createdHotel = await prisma.hotel.create({
    data: {
      ...req.body,
      ownerId: req.user?.id,
      ...getDBTimestamps(true),
    },
  });

  if (!createdHotel) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_RESPONSE"));
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(true, createdHotel, null));
});
