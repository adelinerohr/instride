import { z } from "zod";

import { dateLikeSchema } from "../utils/schema";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  phone: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  role: z.string(),
  banned: z.boolean(),
  banReason: z.string().nullable(),
  banExpires: dateLikeSchema.nullable(),
  createdAt: dateLikeSchema,
  updatedAt: dateLikeSchema,
});

export const createUserInputSchema = userSchema.omit({
  id: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserInputSchema = userSchema.pick({
  name: true,
  image: true,
  phone: true,
  email: true,
});
