import type { events } from "#client";

export const eventKeys = {
  list: (params: events.ListEventsRequest) => ["events", params] as const,
  byId: (id: string) => ["events", id] as const,
};
