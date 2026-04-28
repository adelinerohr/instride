import type {
  GetConversationResponse,
  ListConversationsRequest,
  ListConversationsResponse,
  ListMessagesRequest,
  ListMessagesResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { chatRepo } from "../chat.repo";
import { toConversation, toConversationSummary, toMessage } from "../mappers";

const DEFAULT_CONVERSATION_LIMIT = 50;
const MAX_CONVERSATION_LIMIT = 100;
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

// ---------------------------------------------------------------------------
// List conversations (inbox)
// ---------------------------------------------------------------------------

export const listConversations = api(
  { expose: true, method: "GET", path: "/chat/conversations", auth: true },
  async (
    request: ListConversationsRequest
  ): Promise<ListConversationsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const limit = clamp(
      request.limit ?? DEFAULT_CONVERSATION_LIMIT,
      1,
      MAX_CONVERSATION_LIMIT
    );

    const rows = await chatRepo.listConversationsForMember({
      organizationId,
      memberId: member.id,
      limit,
    });

    // Resolve last-message + unread-count per conversation. N+1 is fine for
    // the scale we expect; if it shows up in profiling, batch via GROUP BY.
    const conversations = await Promise.all(
      rows.map(async (row) => {
        const [lastMessage, unreadCount] = await Promise.all([
          chatRepo.findLastMessageForConversation(row.id),
          chatRepo.countUnreadForParticipant(row.id, member.id),
        ]);
        return toConversationSummary(row, {
          lastMessage: lastMessage ?? null,
          unreadCount,
        });
      })
    );

    return { conversations };
  }
);

// ---------------------------------------------------------------------------
// Get one conversation
// ---------------------------------------------------------------------------

export const getConversation = api(
  {
    expose: true,
    method: "GET",
    path: "/chat/conversations/:id",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetConversationResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Authz: must be an active participant. Throws if not.
    await chatRepo.requireActiveParticipant(id, member.id);

    const conversation = await chatRepo.findOneConversation(id, organizationId);
    return { conversation: toConversation(conversation) };
  }
);

// ---------------------------------------------------------------------------
// List messages in a conversation
// ---------------------------------------------------------------------------

export const listMessages = api(
  {
    expose: true,
    method: "GET",
    path: "/chat/conversations/:conversationId/messages",
    auth: true,
  },
  async (request: ListMessagesRequest): Promise<ListMessagesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Authz
    await chatRepo.requireActiveParticipant(request.conversationId, member.id);

    // Confirm the conversation exists in this org. requireActiveParticipant
    // confirms membership but not tenancy; this guards against cross-org
    // probes that would still see participation rows.
    await chatRepo.findOneConversationScalar(
      request.conversationId,
      organizationId
    );

    const limit = clamp(
      request.limit ?? DEFAULT_MESSAGE_LIMIT,
      1,
      MAX_MESSAGE_LIMIT
    );

    // Fetch limit+1 to detect "has more"
    const rows = await chatRepo.listMessages({
      conversationId: request.conversationId,
      cursor:
        request.cursorCreatedAt && request.cursorId
          ? {
              createdAt: new Date(request.cursorCreatedAt),
              id: request.cursorId,
            }
          : undefined,
      limit: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    const nextCursor = hasMore
      ? {
          createdAt: page[page.length - 1].createdAt.toISOString(),
          id: page[page.length - 1].id,
        }
      : null;

    return {
      messages: page.map(toMessage),
      nextCursor,
      hasMore,
    };
  }
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
