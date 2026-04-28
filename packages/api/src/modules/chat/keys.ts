import { ListConversationsRequest } from "#contracts";

export const chatKeys = {
  all: () => ["chat"] as const,
  conversations: {
    all: () => [...chatKeys.all(), "conversations"] as const,
    list: (params?: ListConversationsRequest) =>
      [...chatKeys.conversations.all(), "list", params ?? {}] as const,
    byId: (conversationId: string) =>
      [...chatKeys.conversations.all(), conversationId] as const,
    messages: (conversationId: string) =>
      [...chatKeys.conversations.byId(conversationId), "messages"] as const,
  },
};
