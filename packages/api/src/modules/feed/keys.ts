import type { feed } from "#client";

const ROOT = ["feed"] as const;

export const feedKeys = {
  all: () => ROOT,
  postsRoot: () => [...ROOT, "posts"] as const,
  postsLists: () => [...ROOT, "posts", "list"] as const,
  postsList: (filters: feed.ListFeedRequest) =>
    [...ROOT, "posts", "list", filters] as const,
  postsDetails: () => [...ROOT, "posts", "detail"] as const,
  postById: (id: string) => [...ROOT, "posts", "detail", id] as const,
};
