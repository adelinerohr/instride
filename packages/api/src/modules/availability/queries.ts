import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";
import { AvailableSlotsRequest } from "#contracts";

import { availabilityKeys } from "./keys";

export const availabilityOptions = {
  availableSlots: (params: AvailableSlotsRequest) =>
    queryOptions({
      queryKey: availabilityKeys.availableSlots(params),
      queryFn: async () => {
        const { slots } =
          await apiClient.availability.getAvailableSlots(params);
        return slots;
      },
    }),
};

export function useAvailableSlots(params: AvailableSlotsRequest) {
  return useQuery(availabilityOptions.availableSlots(params));
}
