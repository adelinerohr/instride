import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { waiverKeys } from "./keys";

export const waiverOptions = {
  list: () =>
    queryOptions({
      queryKey: waiverKeys.list(),
      queryFn: async () => {
        const { waivers } = await apiClient.waivers.listWaivers();
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

export function useWaivers() {
  return useQuery(waiverOptions.list());
}

export function useWaiver(waiverId: string) {
  return useQuery(waiverOptions.byId(waiverId));
}
