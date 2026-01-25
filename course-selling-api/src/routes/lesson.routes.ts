import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middlware";
import {
  roleValidator,
  validateReqBody,
} from "../middleware/validation.middleware";
import { CreateLessonSchema } from "../zod/requestSchema";
import { addCourseLesson } from "../controllers/lesson.controller";

const router = Router();

router.post(
  "/",
  verifyJwt,
  roleValidator(["INSTRUCTOR"]),
  validateReqBody(CreateLessonSchema),
  addCourseLesson,
);

export default router;
