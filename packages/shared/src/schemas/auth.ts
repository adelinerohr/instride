import { z } from "zod";

import { passwordValidator } from "../utils/password";

export const loginSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, "Email is required")
    .max(255, "Maximum 255 characters allowed"),
  password: z.string().max(72, "Maximum 72 characters allowed"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(64, "Maximum 64 characters allowed"),
    email: z
      .email("Enter a valid email address")
      .trim()
      .min(1, "Email is required")
      .max(255, "Maximum 255 characters allowed"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(72, "Maximum 72 characters allowed")
      .refine((val) => passwordValidator.validate(val).success, {
        message: "Password does not meet the requirements",
      }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, "Email is required")
    .max(255, "Maximum 255 characters allowed"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .max(72, "Maximum 72 characters allowed")
      .refine((val) => passwordValidator.validate(val).success, {
        message: "Password does not meet the requirements",
      }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  code: z.string().min(6).max(6),
});
