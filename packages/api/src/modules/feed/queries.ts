import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { STALE } from "#_internal/constants";
import { apiClient, type feed } from "#client";

import { feedKeys } from "./keys";

interface FeedPageParam {
  createdAt: string;
  id: string;
}

export const feedOptions = {
  posts: (filters: feed.ListFeedRequest = {}) =>
    infiniteQueryOptions({
      queryKey: feedKeys.postsList(filters),
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
        return await apiClient.feed.listFeed(params);
      },
      initialPageParam: undefined as FeedPageParam | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: STALE.SECONDS.THIRTY,
    }),
  postById: (id: string) =>
    queryOptions({
      queryKey: feedKeys.postById(id),
      queryFn: async () => {
        const { post } = await apiClient.feed.getFeedPost(id);
        return post;
      },
      staleTime: STALE.SECONDS.THIRTY,
    }),
};

export function useFeedPosts(filters: feed.ListFeedRequest = {}) {
  return useInfiniteQuery(feedOptions.posts(filters));
}

export function useFeedPost(id: string) {
  return useQuery(feedOptions.postById(id));
}
