import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { businessHoursKeys } from "../keys";

// ---- Query Options ------------------------------------------------------------

export const businessHoursOptions = {
  organization: () =>
    queryOptions({
      queryKey: businessHoursKeys.organization(),
      queryFn: async () =>
        await apiClient.availability.listOrganizationBusinessHours(),
    }),
  trainer: (trainerId: string) =>
    queryOptions({
      queryKey: businessHoursKeys.trainer(trainerId),
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
