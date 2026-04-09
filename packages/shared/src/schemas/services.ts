import { z } from "zod";

export const serviceInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  creditPrice: z.number().min(0),
  creditAdditionalPrice: z.number().min(0).optional(),
  maxRiders: z.number().min(1),
  isPrivate: z.boolean(),
  canRecurBook: z.boolean(),
  isRestricted: z.boolean(),
  restrictedToLevelId: z.string().optional(),
  duration: z.number().min(1),
  canRiderAdd: z.boolean(),
});

export type ServiceInputSchema = z.infer<typeof serviceInputSchema>;
