import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, events } from "#client";

import { eventKeys } from "./keys";

export const eventOptions = {
  list: (params: events.ListEventsRequest) =>
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

export const useListEvents = (params: events.ListEventsRequest) => {
  return useQuery(eventOptions.list(params));
};

export const useGetEvent = (id: string) => {
  return useQuery(eventOptions.byId(id));
};
