import { MessageResponseStatus } from "@instride/shared";
import { and, eq, isNull } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import {
  conversationExpansion,
  conversationSummaryExpansion,
  messageExpansion,
  messageResponseExpansion,
} from "./fragments";
import {
  conversationParticipants,
  conversationSubjectRiders,
  conversations,
  messageResponses,
  messages,
  type ConversationRow,
  type MessageResponseRow,
  type MessageRow,
  type NewConversationParticipantRow,
  type NewConversationRow,
  type NewConversationSubjectRiderRow,
  type NewMessageResponseRow,
  type NewMessageRow,
} from "./schema";

interface ListConversationsFilters {
  organizationId: string;
  memberId: string;
  limit: number;
}

interface ListMessagesFilters {
  conversationId: string;
  cursor?: { createdAt: Date; id: string };
  limit: number; // already-clamped, includes the +1 lookahead
}

export const createChatRepo = (client: Database | Transaction = db) => ({
  // ============================================================================
  // Conversations
  // ============================================================================

  createConversation: async (data: NewConversationRow) => {
    const [conversation] = await client
      .insert(conversations)
      .values(data)
      .returning();
    assertExists(conversation, "Failed to create conversation");
    return conversation;
  },

  findOneConversation: async (id: string, organizationId: string) => {
    const conversation = await client.query.conversations.findFirst({
      where: { id, organizationId, deletedAt: { isNull: true } },
      with: conversationExpansion,
    });
    assertExists(conversation, "Conversation not found");
    return conversation;
  },

  findOneConversationScalar: async (id: string, organizationId: string) => {
    const conversation = await client.query.conversations.findFirst({
      where: { id, organizationId },
    });
    assertExists(conversation, "Conversation not found");
    return conversation;
  },

  /**
   * Conversations the member is currently a participant in. Excludes
   * soft-deleted conversations and ones the member has soft-left.
   *
   * Note: lastMessage and unreadCount are NOT loaded here. The caller
   * (typically the API layer) fetches those separately and assembles the
   * ConversationSummary via toConversationSummary in mappers.ts.
   */
  listConversationsForMember: async (filters: ListConversationsFilters) => {
    return await client.query.conversations.findMany({
      where: {
        organizationId: filters.organizationId,
        deletedAt: { isNull: true },
        activeParticipants: {
          memberId: filters.memberId,
        },
      },
      orderBy: { lastMessageAt: "desc" },
      limit: filters.limit,
      with: conversationSummaryExpansion,
    });
  },

  updateConversation: async (
    id: string,
    organizationId: string,
    data: Partial<ConversationRow>
  ) => {
    const [conversation] = await client
      .update(conversations)
      .set(data)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(conversation, "Conversation not found");
    return conversation;
  },

  /**
   * Bumps lastMessageAt. Called by sendMessage in the same transaction
   * so the inbox sort order stays consistent.
   */
  touchConversationLastMessageAt: async (id: string, at: Date) => {
    await client
      .update(conversations)
      .set({ lastMessageAt: at })
      .where(eq(conversations.id, id));
  },

  // ============================================================================
  // Subject riders
  // ============================================================================

  addSubjectRiders: async (rows: NewConversationSubjectRiderRow[]) => {
    if (rows.length === 0) return [];
    return await client
      .insert(conversationSubjectRiders)
      .values(rows)
      .returning();
  },

  // ============================================================================
  // Participants
  // ============================================================================

  addParticipants: async (rows: NewConversationParticipantRow[]) => {
    if (rows.length === 0) return [];
    return await client
      .insert(conversationParticipants)
      .values(rows)
      .returning();
  },

  findParticipant: async (conversationId: string, memberId: string) => {
    return await client.query.conversationParticipants.findFirst({
      where: { conversationId, memberId },
    });
  },

  /**
   * Confirms the member is an active participant. Used for authz
   * checks at the API layer.
   */
  requireActiveParticipant: async (
    conversationId: string,
    memberId: string
  ) => {
    const participant = await client.query.conversationParticipants.findFirst({
      where: { conversationId, memberId, leftAt: { isNull: true } },
    });
    assertExists(participant, "Not a participant in this conversation");
    return participant;
  },

  markParticipantRead: async (
    conversationId: string,
    memberId: string,
    upToMessageId: string
  ) => {
    await client
      .update(conversationParticipants)
      .set({ lastReadMessageId: upToMessageId })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.memberId, memberId)
        )
      );
  },

  softLeaveConversation: async (conversationId: string, memberId: string) => {
    await client
      .update(conversationParticipants)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.memberId, memberId),
          isNull(conversationParticipants.leftAt)
        )
      );
  },

  // ============================================================================
  // Messages
  // ============================================================================

  createMessage: async (data: NewMessageRow) => {
    const [message] = await client.insert(messages).values(data).returning();
    assertExists(message, "Failed to create message");
    return message;
  },

  findOneMessage: async (id: string) => {
    const message = await client.query.messages.findFirst({
      where: { id, deletedAt: { isNull: true } },
      with: messageExpansion,
    });
    assertExists(message, "Message not found");
    return message;
  },

  findOneMessageScalar: async (id: string) => {
    const message = await client.query.messages.findFirst({
      where: { id },
    });
    assertExists(message, "Message not found");
    return message;
  },

  listMessages: async (filters: ListMessagesFilters) => {
    return await client.query.messages.findMany({
      where: {
        conversationId: filters.conversationId,
        deletedAt: { isNull: true },
        ...(filters.cursor && {
          OR: [
            { createdAt: { lt: filters.cursor.createdAt } },
            {
              AND: [
                { createdAt: { eq: filters.cursor.createdAt } },
                { id: { lt: filters.cursor.id } },
              ],
            },
          ],
        }),
      },
      orderBy: { createdAt: "desc", id: "desc" },
      limit: filters.limit,
      with: messageExpansion,
    });
  },

  /**
   * The most recent non-deleted message in a conversation. Used to
   * populate ConversationSummary.lastMessage.
   */
  findLastMessageForConversation: async (conversationId: string) => {
    return await client.query.messages.findFirst({
      where: { conversationId, deletedAt: { isNull: true } },
      orderBy: { createdAt: "desc" },
      with: messageExpansion,
    });
  },

  updateMessage: async (id: string, data: Partial<MessageRow>) => {
    const [message] = await client
      .update(messages)
      .set(data)
      .where(eq(messages.id, id))
      .returning();
    assertExists(message, "Message not found");
    return message;
  },

  softDeleteMessage: async (id: string) => {
    await client
      .update(messages)
      .set({ deletedAt: new Date() })
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)));
  },

  /**
   * Counts non-deleted messages newer than the member's lastReadMessageId.
   * Used to populate ConversationSummary.unreadCount.
   *
   * Implementation note: this is N+1 across conversations. For your scale
   * (small/medium facilities, dozens of conversations per user) it's fine.
   * If it ever becomes a hot path, batch via a single GROUP BY query.
   */
  countUnreadForParticipant: async (
    conversationId: string,
    memberId: string
  ): Promise<number> => {
    const participant = await client.query.conversationParticipants.findFirst({
      where: { conversationId, memberId },
    });
    if (!participant) return 0;

    // If never read, every message counts.
    if (!participant.lastReadMessageId) {
      const all = await client.query.messages.findMany({
        where: { conversationId, deletedAt: { isNull: true } },
        columns: { id: true },
      });
      return all.length;
    }

    const lastRead = await client.query.messages.findFirst({
      where: { id: participant.lastReadMessageId },
      columns: { createdAt: true },
    });
    if (!lastRead) return 0;

    const newer = await client.query.messages.findMany({
      where: {
        conversationId,
        deletedAt: { isNull: true },
        createdAt: { gt: lastRead.createdAt },
        // Exclude the member's own messages — your unread count
        // shouldn't include things you sent.
        senderId: { ne: memberId },
      },
      columns: { id: true },
    });
    return newer.length;
  },

  // ============================================================================
  // Message responses
  // ============================================================================

  createMessageResponse: async (data: NewMessageResponseRow) => {
    const [response] = await client
      .insert(messageResponses)
      .values(data)
      .returning();
    assertExists(response, "Failed to create message response");
    return response;
  },

  findOneMessageResponse: async (messageId: string) => {
    return await client.query.messageResponses.findFirst({
      where: { messageId },
      with: messageResponseExpansion,
    });
  },

  /**
   * Atomic status transition. Used by the response saga to claim the
   * 'processing' state — the WHERE clause includes the expected current
   * status, so two concurrent calls can't both succeed.
   *
   * Returns the updated row, or null if the row was not in the expected
   * status (i.e., somebody else got there first).
   */
  transitionMessageResponseStatus: async (
    messageId: string,
    fromStatus: MessageResponseStatus,
    toStatus: MessageResponseStatus,
    additionalFields: Partial<MessageResponseRow> = {}
  ): Promise<MessageResponseRow | null> => {
    const [response] = await client
      .update(messageResponses)
      .set({ status: toStatus, ...additionalFields })
      .where(
        and(
          eq(messageResponses.messageId, messageId),
          eq(messageResponses.status, fromStatus)
        )
      )
      .returning();
    return response ?? null;
  },
});

export const chatRepo = createChatRepo();
