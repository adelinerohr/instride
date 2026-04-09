import { z } from "zod";

import { dateLikeSchema } from "../utils/schema";

export const boardSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: dateLikeSchema,
  updatedAt: dateLikeSchema,
  organizationId: z.string(),
  canRiderAdd: z.boolean(),
});

export const boardAssignmentSchema = z.object({
  id: z.string(),
  createdAt: dateLikeSchema,
  boardId: z.string(),
  memberId: z.string(),
  isTrainer: z.boolean(),
});

/**
 * Requests
 */
export const createBoardInputSchema = boardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  organizationId: true,
});

export const updateBoardInputSchema = createBoardInputSchema.extend({
  trainerIds: z.array(z.object({ id: z.string() })),
  serviceIds: z.array(z.object({ id: z.string() })),
});

export const createBoardAssignmentInputSchema = boardAssignmentSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    organizationId: z.string(),
  });

export const updateBoardAssignmentInputSchema =
  createBoardAssignmentInputSchema.partial();
