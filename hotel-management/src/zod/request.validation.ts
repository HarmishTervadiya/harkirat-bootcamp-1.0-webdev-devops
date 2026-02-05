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

export const createBookingSchema = z
  .object({
    roomId: z.string(),
    checkInDate: z.coerce.date(),
    checkOutDate: z.coerce.date(),
    guests: z.number().min(1, { error: "Minimum 1 guest is required" }),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return data.checkInDate > today;
    },
    {
      message: "Check-in date must be in future",
      path: ["checkInDate"],
    },
  );

export const addReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number(),
  comment: z.string(),
});
