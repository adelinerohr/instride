import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, type availability } from "#client";

import { availabilityKeys } from "./keys";

export const availabilityOptions = {
  availableSlots: (params: availability.AvailableSlotsParams) =>
    queryOptions({
      queryKey: availabilityKeys.availableSlots(params),
      queryFn: async () => {
        const { slots } =
          await apiClient.availability.getAvailableSlots(params);
        return slots;
      },
    }),
};

export function useAvailableSlots(params: availability.AvailableSlotsParams) {
  return useQuery(availabilityOptions.availableSlots(params));
}
