const ROOT = ["members"] as const;

export const memberKeys = {
  all: () => ROOT,
  lists: () => [...ROOT, "list"] as const,
  list: () => [...ROOT, "list", "all"] as const,
  details: () => [...ROOT, "detail"] as const,
  byId: (id: string) => [...ROOT, "detail", id] as const,
  me: () => [...ROOT, "me"] as const,

  trainers: () => [...ROOT, "trainers"] as const,
  trainerById: (id: string) => [...ROOT, "trainers", "detail", id] as const,

  riders: () => [...ROOT, "riders", "list"] as const,
  ridersRoot: () => [...ROOT, "riders"] as const,
  riderById: (id: string) => [...ROOT, "riders", "detail", id] as const,
  stats: () => [...ROOT, "riders", "stats"] as const,
};
