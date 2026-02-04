import * as z from "zod";
import { UserRole } from "../../generated/prisma/enums";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email",
  }),
  password: z.string({
    message: "Enter a valid password",
  }),
});

export const SignupSchema = z.object({
  name: z.string({
    message: "Enter a valid name",
  }),
  email: z.string().email({
    message: "Enter a valid email",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  role: z.enum(UserRole, {
    message: "Enter a valid role",
  }),
  phone: z
    .string()
    .min(10, {
      message: "Enter a valid phone number",
    })
    .max(15, {
      message: "Enter a valid phone number",
    }),
});

export const createHotelSchema = z.object({
  name: z.string(),
  description: z.string(),
  city: z.string(),
  country: z.string(),
  amenities: z.array(z.string()),
});

export const addHotelRoomSchema = z.object({
  roomNumber: z.string(),
  roomType: z.string(),
  pricePerNight: z.number(),
  maxOccupancy: z.number(),
});
