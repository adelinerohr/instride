import type { types } from "@instride/api";
import { serviceInputSchema } from "@instride/shared";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const serviceSchema = serviceInputSchema.extend({
  boardIds: z.array(z.object({ id: z.string() })),
  trainerIds: z.array(z.object({ id: z.string() })),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

const serviceDefaultValues: ServiceFormValues = {
  name: "",
  description: "",
  price: 0,
  creditPrice: 0,
  creditAdditionalPrice: undefined,
  maxRiders: 1,
  isPrivate: false,
  canRecurBook: false,
  isRestricted: false,
  restrictedToLevelId: "",
  duration: 30,
  canRiderAdd: false,
  boardIds: [],
  trainerIds: [{ id: "" }],
};

export const serviceFormOpts = formOptions({
  defaultValues: serviceDefaultValues,
  validators: {
    onSubmit: serviceSchema,
  },
});

export function buildServiceDefaultValues(
  service: types.Service
): ServiceFormValues {
  if (!service) return serviceDefaultValues;
  return {
    name: service.name,
    description: service.description ?? undefined,
    price: service.price,
    creditPrice: service.creditPrice,
    creditAdditionalPrice: service.creditAdditionalPrice ?? undefined,
    maxRiders: service.maxRiders,
    isPrivate: service.isPrivate,
    canRecurBook: service.canRecurBook,
    isRestricted: service.isRestricted,
    restrictedToLevelId: service.restrictedToLevelId ?? undefined,
    duration: service.duration,
    canRiderAdd: service.canRiderAdd,
    boardIds:
      service.boardAssignments?.map((assignment) => ({
        id: assignment.boardId,
      })) ?? [],
    trainerIds:
      service.trainerAssignments?.map((assignment) => ({
        id: assignment.trainerId,
      })) ?? [],
  };
}
