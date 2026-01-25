import { prisma } from "../../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const purchaseCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const existingPurchase = await prisma.purchase.findFirst({
    where: { userId: req.user!.id },
  });

  if (existingPurchase) {
    return res
      .status(409)
      .json(new ApiError("Course is already purchased", 409));
  }

  const purchasedCourse = await prisma.purchase.create({
    data: { courseId, userId: req.user!.id },
    include: {
      course: true,
    },
  });

  if (!purchasedCourse) {
    return res.status(500).json(new ApiError("Failed to make a purchase", 500));
  }

  return res
    .status(201)
    .json(new ApiResponse(purchasedCourse, "Course purchased successfully"));
});
