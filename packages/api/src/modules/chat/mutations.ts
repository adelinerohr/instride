import { useQueryClient } from "@tanstack/react-query";

import { MutationHookOptions, useWrappedMutation } from "#_internal";
import { apiClient } from "#client";
import {
  CancelMessageResponseRequest,
  CreateConversationRequest,
  MarkConversationReadRequest,
  RespondToMessageRequest,
  SendMessageRequest,
  UpdateMessageRequest,
} from "#contracts";

import { chatKeys } from "./keys";

// =============================================================================
// Mutation functions
// =============================================================================

export const chatMutations = {
  create: async (request: CreateConversationRequest) =>
    await apiClient.chat.createChatConversation(request),

  sendMessage: async ({ conversationId, ...request }: SendMessageRequest) => {
    const { message } = await apiClient.chat.sendMessage(
      conversationId,
      request
    );
    return message;
  },

  updateMessage: async ({ messageId, ...request }: UpdateMessageRequest) => {
    const { message } = await apiClient.chat.updateMessage(messageId, request);
    return message;
  },

  deleteMessage: async (messageId: string) =>
    await apiClient.chat.deleteMessage(messageId),

  markConversationRead: async ({
    conversationId,
    ...request
  }: MarkConversationReadRequest) =>
    await apiClient.chat.markConversationRead(conversationId, request),

  respondToMessage: async ({
    messageId,
    ...request
  }: RespondToMessageRequest) => {
    const { response } = await apiClient.chat.respondToChatMessage(
      messageId,
      request
    );
    return response;
  },

  cancelChatMessageResponse: async ({
    messageId,
  }: CancelMessageResponseRequest) => {
    const { response } =
      await apiClient.chat.cancelChatMessageResponse(messageId);
    return response;
  },
};

// =============================================================================
// Hooks
// =============================================================================
//
// Invalidation philosophy:
//   - The chat WebSocket stream pushes the canonical state for messages,
//     responses, and conversation summaries. Mutations don't need to do
//     fine-grained cache surgery — the stream handler in connectChatStream
//     will deliver the up-to-date entity within milliseconds.
//   - Mutations invalidate the queries that should reload, so the user
//     sees fresh data even if the stream event is delayed or missed.
//   - We explicitly do NOT setQueryData on infinite-query keys here.
//     The cache shape is InfiniteData<...>, not a bare entity, so a
//     bare write would corrupt the cache.

// -----------------------------------------------------------------------------
// Conversations
// -----------------------------------------------------------------------------

export function useCreateConversation({
  mutationConfig,
}: MutationHookOptions<typeof chatMutations.create> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(chatMutations.create, {
    ...config,
    onSuccess: (result, ...args) => {
      // Seed the single-conversation cache so navigating to the new
      // conversation is instant. (Not an infinite query — flat entity.)
      queryClient.setQueryData(
        chatKeys.conversations.byId(result.conversation.id),
        result.conversation
      );
      // Refetch the inbox so the new conversation appears.
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all(),
      });
      onSuccess?.(result, ...args);
    },
  });
}

// -----------------------------------------------------------------------------
// Messages
// -----------------------------------------------------------------------------

export function useSendMessage({
  mutationConfig,
}: MutationHookOptions<typeof chatMutations.sendMessage> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(chatMutations.sendMessage, {
    ...config,
    onSuccess: (message, ...args) => {
      // The stream's message_created handler will prepend the message
      // into the infinite cache. We invalidate the inbox so lastMessage
      // and unreadCount reflect the new state — the server computes
      // unreadCount per-viewer, so we can't do this client-side.
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all(),
      });
      onSuccess?.(message, ...args);
    },
  });
}

export function useUpdateMessage({
  mutationConfig,
}: MutationHookOptions<typeof chatMutations.updateMessage> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(chatMutations.updateMessage, {
    ...config,
    onSuccess: (message, ...args) => {
      // Invalidate the message list so the edit lands. Stream will also
      // deliver the message_updated event; whichever arrives first wins.
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.messages(message.conversationId),
      });
      onSuccess?.(message, ...args);
    },
  });
}

export function useDeleteMessage({
  mutationConfig,
}: MutationHookOptions<typeof chatMutations.deleteMessage> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(chatMutations.deleteMessage, {
    ...config,
    onSuccess: (result, variables, ...args) => {
      // We don't know the conversationId from just a messageId. Invalidate
      // all chat queries — the stream handler will narrow this down with
      // the message_updated event when it arrives. Cheap enough.
      queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
      });
      // Also invalidate the inbox since the deleted message might have
      // been a conversation's lastMessage.
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all(),
      });
      onSuccess?.(result, variables, ...args);
    },
  });
}

export function useMarkConversationRead({
  mutationConfig,
}: MutationHookOptions<typeof chatMutations.markConversationRead> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(chatMutations.markConversationRead, {
    ...config,
    onSuccess: (result, variables, ...args) => {
      // Read state changes the inbox's per-conversation unreadCount.
      // Server computes that, so we invalidate rather than guess.
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all(),
      });
      // The single-conversation entity also carries participant.lastReadMessageId
      // so refetch that too.
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.byId(variables.conversationId),
      });
      onSuccess?.(result, variables, ...args);
    },
  });
}

// -----------------------------------------------------------------------------
// Message responses (lesson invitation accept/decline/cancel)
// -----------------------------------------------------------------------------
//
// Responses are nested inside Message entities. The stream's
// response_updated handler patches the response field of the relevant
// message in the infinite cache. Mutations here just need to invalidate
// the message list so the new response state is visible if the stream
// is delayed.

export function useRespondToMessage({
  mutationConfig,
}: MutationHookOptions<typeof chatMutations.respondToMessage> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(chatMutations.respondToMessage, {
    ...config,
    onSuccess: (result, variables, ...args) => {
      // We don't have conversationId here — only messageId. Invalidate
      // all message lists; the stream handler will land the canonical
      // response state shortly. (For typical apps with a few open
      // conversations, this is a handful of queries.)
      queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
        // Match messages(*) keys without listing them all
        predicate: (query) =>
          query.queryKey[0] === "chat" &&
          query.queryKey[query.queryKey.length - 1] === "messages",
      });
      // Inbox might also need refresh if accepting/declining changed
      // anything visible in the summary.
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all(),
      });
      onSuccess?.(result, variables, ...args);
    },
  });
}

export function useCancelChatMessageResponse({
  mutationConfig,
}: MutationHookOptions<typeof chatMutations.cancelChatMessageResponse> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(chatMutations.cancelChatMessageResponse, {
    ...config,
    onSuccess: (result, variables, ...args) => {
      // Same as respondToMessage — invalidate message lists so the
      // cancelled state lands in the cache.
      queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
        predicate: (query) =>
          query.queryKey[0] === "chat" &&
          query.queryKey[query.queryKey.length - 1] === "messages",
      });
      onSuccess?.(result, variables, ...args);
    },
  });
}
