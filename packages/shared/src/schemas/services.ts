import { z } from "zod";

export const serviceInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().min(0),
  creditPrice: z.number().min(0),
  creditAdditionalPrice: z.number().min(0).nullable(),
  maxRiders: z.number().min(1),
  isPrivate: z.boolean(),
  canRecurBook: z.boolean(),
  isRestricted: z.boolean(),
  restrictedToLevelId: z.string().nullable(),
  duration: z.number().min(1),
  canRiderAdd: z.boolean(),
  trainerIds: z.array(z.string()),
  boardIds: z.array(z.string()),
});

export type ServiceInputSchema = z.infer<typeof serviceInputSchema>;
