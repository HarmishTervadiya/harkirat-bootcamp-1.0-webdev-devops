import z from "zod";

export const SignupSchema = z.object({
  email: z.email({ error: "Enter a valid email" }).toLowerCase(),
  password: z.minLength(6, {
    error: "Passwrod must be atleast 6 characters long",
  }),
  name: z.string({ error: "Enter the name" }),
  role: z.enum(["STUDENT", "INSTRUCTOR"], { error: "Invalid Role" }),
});

export const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email" }),
  password: z.minLength(6, { error: "Enter a valid passowrd" }),
});

export const CreateCourseSchema = z.object({
  title: z.string({ error: "Enter a valida title" }),
  description: z.string({ error: "Enter a valida descrtion" }),
  price: z.number().int(),
});

export const CreateLessonSchema = z.object({
  title: z.string({ error: "Enter a valida title" }),
  content: z.string({ error: "Enter a valida content" }),
  courseId: z.string({ error: "Enter a valida courseId" }),
});

export const PurchaseCourseSchema = z.object({
  courseId: z.string({ error: "Enter a valida courseId" }),
});
