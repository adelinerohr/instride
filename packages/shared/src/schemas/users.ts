import { z } from "zod";

export const baseUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(64, "Name must be less than 64 characters"),
  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, "Email is required")
    .max(255, "Maximum 255 characters allowed"),
  image: z.string().nullable(),
  phone: z.string().nullable(),
  role: z.enum(["admin", "user"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export const createUserSchema = baseUserSchema;

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(64, "Name must be less than 64 characters"),
  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, "Email is required")
    .max(255, "Maximum 255 characters allowed"),
  image: z.string().nullable(),
  phone: z.string().nullable(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  imageFile: z.file().nullable(),
  removeImage: z.boolean(),
});
