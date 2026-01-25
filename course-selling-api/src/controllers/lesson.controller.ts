import { prisma } from "../../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const addCourseLesson = asyncHandler(async (req, res) => {
  const { title, content, courseId } = req.body;

  const existingLesson = await prisma.lesson.findFirst({ where: { title } });
  if (existingLesson) {
    return res.status(409).json(new ApiError("Lesson already exists", 409));
  }

  const createdLesson = await prisma.lesson.create({
    data: { title, content, courseId: courseId },
  });

  if (!createdLesson) {
    return res.status(500).json(new ApiError("Failed to created lesson", 500));
  }

  return res
    .status(201)
    .json(new ApiResponse(createdLesson, "Lesson added successfully"));
});

export const getCourseLessons = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(404).json(new ApiError("Course not found", 404));
  }

  const courseLessons = await prisma.lesson.findMany({
    where: { courseId: courseId.toString() },
  });

  if (!courseLessons) {
    return res.status(404).json(new ApiError("Lessons not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse(courseLessons, "Fetched succssfullly"));
});
