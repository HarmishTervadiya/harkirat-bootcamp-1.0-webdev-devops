import { Router } from "express";
import { authenticate, roleCheck } from "../middleware/auth";
import { providerDailySchedule } from "../controller/providers.controller";
const router = Router();

router.get(
  "/me/schedule",
  authenticate,
  roleCheck("SERVICE_PROVIDER"),
  providerDailySchedule,
);

export default router;
