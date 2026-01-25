import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middlware";
import {
  roleValidator,
  validateReqBody,
} from "../middleware/validation.middleware";
import { PurchaseCourseSchema } from "../zod/requestSchema";
import { purchaseCourse } from "../controllers/purchase.controller";

const router = Router();

router.post(
  "/",
  verifyJwt,
  roleValidator(["STUDENT"]),
  validateReqBody(PurchaseCourseSchema),
  purchaseCourse,
);

export default router;
