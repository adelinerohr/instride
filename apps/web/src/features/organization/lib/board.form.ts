import type { types } from "@instride/api";
import { createBoardInputSchema } from "@instride/shared";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const boardSchema = createBoardInputSchema.extend({
  trainerIds: z
    .array(z.object({ id: z.string() }))
    .min(1, "Select at least one trainer"),
  serviceIds: z.array(z.object({ id: z.string() })),
});

export type BoardFormValues = z.infer<typeof boardSchema>;

const boardDefaultValues: BoardFormValues = {
  name: "",
  canRiderAdd: false,
  trainerIds: [{ id: "" }],
  serviceIds: [],
};

export const boardFormOpts = formOptions({
  defaultValues: boardDefaultValues,
  validators: { onSubmit: boardSchema },
});

export function buildBoardDefaultValues(
  board?: types.GetBoardResponse["board"]
): BoardFormValues {
  if (!board) return boardDefaultValues;

  return {
    name: board.name,
    canRiderAdd: board.canRiderAdd,
    trainerIds:
      board.assignments?.map((assignment) => ({
        id: assignment.trainerId ?? "",
      })) ?? [],
    serviceIds:
      board.serviceBoardAssignments?.map((assignment) => ({
        id: assignment.serviceId,
      })) ?? [],
  };
}
