import { z } from "zod";

export const createBoardInputSchema = z.object({
  name: z.string(),
  canRiderAdd: z.boolean(),
});

export const updateBoardInputSchema = createBoardInputSchema.extend({
  trainerIds: z.array(z.object({ id: z.string() })),
  serviceIds: z.array(z.object({ id: z.string() })),
});

export const createBoardAssignmentInputSchema = z.object({
  boardId: z.string(),
  memberId: z.string(),
  isTrainer: z.boolean(),
  organizationId: z.string(),
});

export const updateBoardAssignmentInputSchema =
  createBoardAssignmentInputSchema.partial();
