import type { FeedFilters } from "@instride/shared";
import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { STALE } from "#_internal/constants";
import { apiClient } from "#client";

import { feedKeys } from "./keys";

interface FeedPageParam {
  createdAt: string;
  id: string;
}

export const feedOptions = (organizationId: string) => {
  const keys = feedKeys(organizationId);

  return {
    posts: (filters: FeedFilters = {}) =>
      infiniteQueryOptions({
        queryKey: keys.postsList(filters),
        queryFn: async ({ pageParam }) => {
          const params = {
            ...(filters.boardId && { boardId: filters.boardId }),
            ...(filters.authorMemberId && {
              authorMemberId: filters.authorMemberId,
            }),
            ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
            ...(pageParam?.createdAt && {
              cursorCreatedAt: pageParam.createdAt,
            }),
            ...(pageParam?.id && { cursorId: pageParam.id }),
          };
          return await apiClient.feed.getFeed(organizationId, params);
        },
        initialPageParam: undefined as FeedPageParam | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: STALE.SECONDS.THIRTY,
      }),
    postById: (id: string) =>
      queryOptions({
        queryKey: keys.postById(id),
        queryFn: async () => {
          const { post } = await apiClient.feed.getFeedPost(id);
          return post;
        },
        staleTime: STALE.SECONDS.THIRTY,
      }),
  };
};

export function useFeedPosts(
  organizationId: string,
  filters: FeedFilters = {}
) {
  return useInfiniteQuery(feedOptions(organizationId).posts(filters));
}

export function useFeedPost(organizationId: string, id: string) {
  return useQuery(feedOptions(organizationId).postById(id));
}
