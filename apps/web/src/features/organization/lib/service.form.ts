import type { types } from "@instride/api";
import { serviceInputSchema, type ServiceInputSchema } from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const serviceDefaultValues: ServiceInputSchema = {
  name: "",
  description: null,
  price: 0,
  creditPrice: 0,
  creditAdditionalPrice: null,
  maxRiders: 1,
  isPrivate: false,
  canRecurBook: false,
  isRestricted: false,
  restrictedToLevelId: null,
  duration: 30,
  canRiderAdd: false,
  boardIds: [],
  trainerIds: [],
};

export const serviceFormOpts = formOptions({
  defaultValues: serviceDefaultValues,
  validators: {
    onSubmit: serviceInputSchema,
  },
});

export function buildServiceDefaultValues(
  service: types.Service
): ServiceInputSchema {
  if (!service) return serviceDefaultValues;
  return {
    name: service.name,
    description: service.description,
    price: service.price,
    creditPrice: service.creditPrice,
    creditAdditionalPrice: service.creditAdditionalPrice,
    maxRiders: service.maxRiders,
    isPrivate: service.isPrivate,
    canRecurBook: service.canRecurBook,
    isRestricted: service.isRestricted,
    restrictedToLevelId: service.restrictedToLevelId,
    duration: service.duration,
    canRiderAdd: service.canRiderAdd,
    boardIds:
      service.boardAssignments?.map((assignment) => assignment.boardId) ?? [],
    trainerIds:
      service.trainerAssignments?.map((assignment) => assignment.trainerId) ??
      [],
  };
}
