import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  PORT: z.coerce.number().int().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const ENV = envSchema.parse(process.env);
