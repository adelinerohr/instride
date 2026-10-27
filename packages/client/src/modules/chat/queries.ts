import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { apiClient } from "#client";
import { ListConversationsRequest } from "#contracts";

import { chatKeys } from "./keys";

export const chatOptions = {
  listConversations: (params: ListConversationsRequest = {}) =>
    queryOptions({
      queryKey: chatKeys.conversations.list(params),
      queryFn: async () => {
        const { conversations } =
          await apiClient.chat.listConversations(params);
        return conversations;
      },
    }),
  getConversation: (conversationId: string) =>
    queryOptions({
      queryKey: chatKeys.conversations.byId(conversationId),
      queryFn: async () => {
        const { conversation } =
          await apiClient.chat.getConversation(conversationId);
        return conversation;
      },
    }),
  listMessages: (conversationId: string, params?: { limit?: number }) =>
    infiniteQueryOptions({
      queryKey: chatKeys.conversations.messages(conversationId),
      queryFn: ({ pageParam }) =>
        apiClient.chat.listMessages(conversationId, {
          limit: params?.limit,
          cursorCreatedAt: pageParam?.createdAt,
          cursorId: pageParam?.id,
        }),
      initialPageParam: null as { createdAt: string; id: string } | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
};

export function useListConversations(params: ListConversationsRequest = {}) {
  return useQuery(chatOptions.listConversations(params));
}

export function useGetConversation(conversationId: string) {
  return useQuery(chatOptions.getConversation(conversationId));
}

export function useListMessages(
  conversationId: string,
  params?: { limit?: number }
) {
  return useInfiniteQuery(chatOptions.listMessages(conversationId, params));
}
