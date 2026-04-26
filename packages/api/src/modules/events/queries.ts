import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";
import { ListEventsRequest } from "#contracts";

import { eventKeys } from "./keys";

export const eventOptions = {
  list: (params: ListEventsRequest) =>
    queryOptions({
      queryKey: eventKeys.list(params),
      queryFn: async () => await apiClient.events.listEvents(params),
      select: (data) => data.events,
    }),
  byId: (id: string) =>
    queryOptions({
      queryKey: eventKeys.byId(id),
      queryFn: async () => await apiClient.events.getEvent(id),
    }),
};

export const useListEvents = (params: ListEventsRequest) => {
  return useQuery(eventOptions.list(params));
};

export const useGetEvent = (id: string) => {
  return useQuery(eventOptions.byId(id));
};
