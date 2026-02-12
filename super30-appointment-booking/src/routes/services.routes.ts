import { Router } from "express";
import { authenticate, roleCheck } from "../middleware/auth";
import {
  createServiceSchema,
  setAvailabilitySchema,
} from "../utils/validation";
import {
  addServiceAvailability,
  createService,
  getServices,
} from "../controller/services.controller";
import { validateRequestBody } from "../middleware/body.validation";
const router = Router();

router
  .route("/")
  .get(getServices)
  .post(
    authenticate,
    roleCheck("SERVICE_PROVIDER"),
    validateRequestBody(createServiceSchema),
    createService,
  );

router.post(
  "/:serviceId/availability",
  authenticate,
  roleCheck("SERVICE_PROVIDER"),
  validateRequestBody(setAvailabilitySchema),
  addServiceAvailability,
);

export default router;
