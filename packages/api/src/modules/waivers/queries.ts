import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { waiverKeys } from "./keys";

export const waiverOptions = (organizationId: string) => {
  const keys = waiverKeys(organizationId);

  return {
    all: () =>
      queryOptions({
        queryKey: keys.all(),
        queryFn: async () => {
          const { waivers } = await apiClient.waivers.list(organizationId);
          return waivers;
        },
      }),
    byId: (waiverId: string) =>
      queryOptions({
        queryKey: keys.byId(waiverId),
        queryFn: async () => {
          const { waiver } = await apiClient.waivers.byId(waiverId);
          return waiver;
        },
      }),
  };
};

export function useWaivers(organizationId: string) {
  return useQuery(waiverOptions(organizationId).all());
}

export function useWaiver(organizationId: string, waiverId: string) {
  return useQuery(waiverOptions(organizationId).byId(waiverId));
}
