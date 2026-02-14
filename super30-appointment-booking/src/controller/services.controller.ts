import { isDate } from "node:util/types";
import { prisma } from "../../db";
import { ServiceType } from "../../generated/prisma/enums";
import type { ServiceWhereInput } from "../../generated/prisma/models";
import { asyncHandler } from "../utils/asyncHandler";
import { deriveSlots, type AppointmentSlot } from "../utils/deriveSlots";

export const createService = asyncHandler(async (req, res) => {
  const { name, type, durationMinutes } = req.body;

  const insertedService = await prisma.service.create({
    data: {
      name,
      type,
      durationMinutes,
      providerId: req.user?.id!,
    },
    select: {
      id: true,
      name: true,
      type: true,
      durationMinutes: true,
    },
  });

  if (!insertedService) {
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }

  console.log("Service created", insertedService);

  return res.status(201).json(insertedService);
});

export const addServiceAvailability = asyncHandler(async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.body;
  const { serviceId } = req.params;

  const existingService = await prisma.service.findFirst({
    where: { id: serviceId?.toString() },
  });

  console.log("Existing service: ", existingService);
  if (!existingService) {
    return res.status(404).json({ error: "Service not found" });
  }

  if (existingService.providerId !== req.user?.id) {
    return res
      .status(403)
      .json({ error: "Service does not belong to provider" });
  }

  const existingAvailability = await prisma.availability.findFirst({
    where: { serviceId: serviceId?.toString(), startTime, endTime },
  });

  console.log("Existing availability: ", existingAvailability);

  if (existingAvailability) {
    return res.status(400).json({ error: "Overlapping availability" });
  }

  const newAvailability = await prisma.availability.create({
    data: {
      dayOfWeek,
      startTime,
      endTime,
      serviceId: serviceId?.toString()!,
    },
  });

  if (!newAvailability) {
    return res.status(500).json({ error: "Internal server error" });
  }

  return res.status(201).json(newAvailability);
});

export const getServices = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let filter: ServiceWhereInput = {};

  if (type && !Object.values(ServiceType).includes(type as any)) {
    return res.status(400).json({ error: "Invalid service type" });
  }

  type && (filter.type = type as ServiceType);

  const services = await prisma.service.findMany({ where: filter });

  return res.status(200).json(services);
});

export const getServiceSlots = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  const parsedDate = new Date(date.toString());
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate < today) {
    return res.status(400).json({ error: "Date cannot be in the past" });
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId!.toString() },
  });

  if (!service) {
    return res.status(404).json({ error: "Service not found" });
  }

  console.log("Service retrived", service.id);

  console.log(parsedDate, parsedDate.getDay());

  const availbility = await prisma.availability.findFirst({
    where: { serviceId: serviceId?.toString(), dayOfWeek: parsedDate.getDay() },
  });

  console.log("Availibility", availbility);

  if (!availbility) {
    return res.status(404).json({ error: "Service not available" });
  }

  let slots: AppointmentSlot[] = deriveSlots(
    serviceId?.toString()!,
    date?.toString()!,
    availbility.startTime,
    availbility.endTime,
    service.durationMinutes,
  );
  console.log("Derived slots: ", slots);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      serviceId: serviceId?.toString(),
      date: parsedDate,
    },
  });

  slots = slots.filter((slot) =>
    existingAppointments.filter((ex) => ex.slotId != slot.slotId),
  );

  console.log("Available slot", slots);
  console.log("Existing appointments", existingAppointments);

  return res.status(200).json({ serviceId, date, slots });
});
