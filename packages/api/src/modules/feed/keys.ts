import type { FeedFilters } from "@instride/shared";

/**
 * Key Hierarchy:
 *   ["feed", orgId]                    ← invalidate entire feed
 *   ["feed", orgId, "posts"]           ← all posts (infinite query root)
 *   ["feed", orgId, "posts", filters]  ← posts list with filters
 *   ["feed", orgId, "posts", id]       ← one post
 */

const getFeedRootKey = ["feed"] as const;

export const feedKeys = {
  all: () => getFeedRootKey,
  posts: () => [...getFeedRootKey, "posts"] as const,
  postsList: (filters: FeedFilters) =>
    [...getFeedRootKey, "posts", filters] as const,
  postById: (id: string) => [...getFeedRootKey, "posts", id] as const,
};
