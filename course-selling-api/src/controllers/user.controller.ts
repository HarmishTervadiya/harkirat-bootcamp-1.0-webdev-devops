import { prisma } from "../../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getStudentCourses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  const offSet = (page - 1) * limit;

  const allCourses = await prisma.purchase.findMany({
    where: { userId: req.user!.id },
    include: { course: true },
    skip: offSet,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
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
