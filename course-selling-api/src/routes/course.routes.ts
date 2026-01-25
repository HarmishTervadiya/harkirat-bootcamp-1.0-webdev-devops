import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getCoursesWithLessons,
  getCourses,
  updateCourse,
  getCourseRevenue,
} from "../controllers/course.controller";
import { verifyJwt } from "../middleware/auth.middlware";
import {
  roleValidator,
  validateReqBody,
} from "../middleware/validation.middleware";
import { CreateCourseSchema } from "../zod/requestSchema";
import { getCourseLessons } from "../controllers/lesson.controller";

const router = Router();

router
  .route("/")
  .get(getCourses)
  .post(
    verifyJwt,
    validateReqBody(CreateCourseSchema),
    roleValidator(["INSTRUCTOR"]),
    createCourse,
  );

router
  .route("/:id")
  .get(getCoursesWithLessons)
  .patch(verifyJwt, roleValidator(["INSTRUCTOR"]), updateCourse)
  .delete(verifyJwt, roleValidator(["INSTRUCTOR"]), deleteCourse);

router.get("/:courseId/lessons", getCourseLessons);

router.get(
  "/:id/stats",
  verifyJwt,
  roleValidator(["INSTRUCTOR"]),
  getCourseRevenue,
);

export default router;
