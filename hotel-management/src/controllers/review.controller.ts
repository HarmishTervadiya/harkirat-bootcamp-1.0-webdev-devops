import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { getDBTimestamps } from "../utils/getDBTimestamps";

export const addReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const existingReview = await prisma.review.findFirst({
    where: { userId: req.user?.id, bookingId },
  });

  if (existingReview) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "ALREADY_REVIEWED"));
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      hotelId: true,
      userId: true,
      checkOutDate: true,
      status: true,
      hotel: {
        select: {
          rating: true,
          totalReviews: true,
        },
      },
    },
  });

  if (!booking) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "BOOKING_NOT_FOUND"));
  }

  if (booking.userId !== req.user?.id) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(new ApiResponse(false, null, "FORBIDDEN"));
  }

  const checkOut = new Date(booking.checkOutDate);
  const now = new Date();
  if (checkOut > now || booking.status !== "confirmed") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "BOOKING_NOT_ELIGIBLE"));
  }

  let newReview;
  await prisma.$transaction(async (tx) => {
    newReview = await tx.review.create({
      data: {
        bookingId,
        comment,
        rating,
        userId: req.user?.id!,
        hotelId: booking.hotelId,
        ...getDBTimestamps(true,false),
      },
    });

    const newRating =
      (booking.hotel.rating.mul(booking.hotel.totalReviews) + rating) /
      (booking.hotel.totalReviews + 1);

    await tx.hotel.update({
      where: { id: booking.hotelId },
      data: {
        rating: newRating,
        totalReviews: { increment: 1 },
      },
    });
  });

  if (!newReview) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_ERROR"));
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(true, newReview, null));
});
