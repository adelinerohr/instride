import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { waiverKeys } from "./keys";

export const waiverOptions = {
  list: (organizationId: string) =>
    queryOptions({
      queryKey: waiverKeys.list(organizationId),
      queryFn: async () => {
        const { waivers } = await apiClient.waivers.listWaivers(organizationId);
        return waivers;
      },
    }),
  byId: (waiverId: string) =>
    queryOptions({
      queryKey: waiverKeys.byId(waiverId),
      queryFn: async () => {
        const { waiver } = await apiClient.waivers.getWaiver(waiverId);
        return waiver;
      },
    }),
};

export function useWaivers(organizationId: string) {
  return useQuery(waiverOptions.list(organizationId));
}

export function useWaiver(waiverId: string) {
  return useQuery(waiverOptions.byId(waiverId));
}
