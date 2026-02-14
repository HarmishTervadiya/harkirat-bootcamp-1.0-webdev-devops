import { Router } from "express";
import { authenticate, roleCheck } from "../middleware/auth";
import { validateRequestBody } from "../middleware/body.validation";
import {
  bookAppointment,
  getUserAppointments,
} from "../controller/appointments.controller";
import { bookAppointmentSchema } from "../utils/validation";
const router = Router();

router.get("/me", authenticate, getUserAppointments);

router.post(
  "/",
  authenticate,
  roleCheck("USER"),
  validateRequestBody(bookAppointmentSchema),
  bookAppointment,
);
export default router;
