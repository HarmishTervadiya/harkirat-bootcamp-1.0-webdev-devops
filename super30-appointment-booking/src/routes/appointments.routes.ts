import { Router } from "express";
import { authenticate, roleCheck } from "../middleware/auth";
import { validateRequestBody } from "../middleware/body.validation";
import { getUserAppointments } from "../controller/appointments.controller";
const router = Router();

router.get("/me", authenticate, getUserAppointments);

export default router;
