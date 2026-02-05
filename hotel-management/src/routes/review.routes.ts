import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";
import { verifyJwt } from "../middlewares/auth.middleware";
import {
  roleValidator,
  validateRequestBody,
} from "../middlewares/validation.middleware";
import { addReviewSchema } from "../zod/request.validation";
import { addReview } from "../controllers/review.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJwt,
    validateRequestBody(addReviewSchema),
    roleValidator(["customer", "owner"]),
    addReview,
  );

export default router;
