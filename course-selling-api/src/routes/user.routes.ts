import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middlware";
import { roleValidator } from "../middleware/validation.middleware";
import { getStudentCourses } from "../controllers/user.controller";

const router = Router();

router.get(
  "/purchases",
  verifyJwt,
  roleValidator(["STUDENT"]),
  getStudentCourses,
);

export default router;
