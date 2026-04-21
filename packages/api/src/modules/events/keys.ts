import type { events } from "#client";

const ROOT = ["events"] as const;

export const eventKeys = {
  all: () => ROOT,
  lists: () => [...ROOT, "list"] as const,
  list: (params: events.ListEventsRequest) =>
    [...ROOT, "list", params] as const,
  details: () => [...ROOT, "detail"] as const,
  byId: (id: string) => [...ROOT, "detail", id] as const,
};
