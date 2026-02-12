import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";

export const getUserAppointments = asyncHandler(async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { userId: req.user?.id! },
  });

  return res.status(200).json(appointments);
});
