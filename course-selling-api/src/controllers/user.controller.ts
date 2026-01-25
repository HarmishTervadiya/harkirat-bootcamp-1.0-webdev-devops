import { prisma } from "../../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getStudentCourses = asyncHandler(async (req, res) => {
  const allCourses = await prisma.purchase.findMany({
    where: { userId: req.user!.id },
    include: { course: true },
  });

  if (!allCourses) {
    return res.status(500).json(new ApiError("Failed to fetch courses", 500));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(allCourses, "All purchased courses fetched succssfully"),
    );
});
