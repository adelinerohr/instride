import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { availabilityKeys } from "../keys";

// ---- Query Options ------------------------------------------------------------

export const businessHoursOptions = {
  organization: () =>
    queryOptions({
      queryKey: availabilityKeys.organizationBusinessHours(),
      queryFn: async () =>
        await apiClient.availability.listOrganizationBusinessHours(),
    }),
  trainer: (trainerId: string) =>
    queryOptions({
      queryKey: availabilityKeys.trainerBusinessHours(trainerId),
      queryFn: async () =>
        await apiClient.availability.listTrainerBusinessHours(trainerId),
    }),
};

// ---- Hooks --------------------------------------------------------------------

export function useOrganizationBusinessHours() {
  return useQuery(businessHoursOptions.organization());
}

export function useTrainerBusinessHours(trainerId: string) {
  return useQuery(businessHoursOptions.trainer(trainerId));
}
