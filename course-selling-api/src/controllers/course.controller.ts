import { prisma } from "../../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price } = req.body;

  const existingCourse = await prisma.course.findFirst({ where: { title } });
  if (existingCourse) {
    return res.status(400).json(new ApiError("Course already exists", 400));
  }

  const createdCourse = await prisma.course.create({
    data: { title, description, price, instructorId: req.user!.id },
  });

  if (!createCourse) {
    return res
      .status(400)
      .json(
        new ApiError("Something went wrong while creating the course", 500),
      );
  }

  return res
    .status(201)
    .json(new ApiResponse(createdCourse, "Course created successfully"));
});

export const getCourses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

  const offSet = (page - 1) * limit;

  const courses = await prisma.course.findMany({
    skip: offSet,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!courses) {
    return res.status(404).json(new ApiError("Courses not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse(courses, "Courses fetched successfully"));
});

export const getCoursesWithLessons = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json(new ApiError("Course not found", 404));
  }

  const course = await prisma.course.findFirst({
    include: {
      lessons: true,
    },
    where: { id: id.toString(), lessons: { some: {} } },
  });

  if (!course) {
    return res.status(404).json(new ApiError("Course not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse(course, "Course lessons fetched successfully"));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json(new ApiError("Course not found", 404));
  }

  const updatedCourse = await prisma.course.update({
    where: { id: id.toString() },
    data: req.body,
  });

  if (!updatedCourse) {
    return res
      .status(500)
      .json(new ApiError("Failed to update the course", 500));
  }

  return res
    .status(200)
    .json(new ApiResponse(updatedCourse, "Course updated successfully"));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json(new ApiError("Course not found", 404));
  }

  const deletedCourse = await prisma.course.delete({
    where: { id: id.toString() },
  });
  if (!deletedCourse) {
    return res.status(500).json(new ApiError("Failed to delete course", 500));
  }

  res.status(200).json(new ApiResponse({}, "Deleted successfully"));
});

export const getCourseRevenue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json(new ApiError("Course not found", 404));
  }

  const course = await prisma.course.findUnique({
    where: { id: id.toString() },
    include: {
      _count: {
        select: {
          purchases: true,
        },
      },
    },
  });

  if (!course) {
    return res
      .status(400)
      .json(new ApiError("Failed to fetch course revenue", 400));
  }

  const totalRevenue = course._count.purchases * course.price;
  return res.status(200).json(
    new ApiResponse(
      {
        id: course.id,
        name: course.title,
        price: course.price,
        totalPurchases: course._count.purchases,
        totalRevenue,
      },
      "Revenue fetched successfully",
    ),
  );
});
