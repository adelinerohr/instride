import type {
  CancelMessageResponseRequest,
  CreateConversationRequest,
  CreateConversationResponse,
  MarkConversationReadRequest,
  RespondToMessageRequest,
  RespondToMessageResponse,
  SendMessageRequest,
  SendMessageResponse,
  UpdateMessageRequest,
} from "@instride/api/contracts";
import { MessageAttachmentType, MessageResponseStatus } from "@instride/shared";
import { api, APIError } from "encore.dev/api";
import { lessons, organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { chatRepo, createChatRepo } from "../chat.repo";
import { createConversation } from "../chat.service";
import { db } from "../db";
import { toMessage } from "../mappers";
import {
  publishChatMessageCreated,
  publishChatMessageUpdated,
} from "../publish";
import { cancelMessageResponse, respondToMessage } from "../response.service";
import {
  assertCanRespond,
  attachmentExpectsResponse,
  validateMessageBody,
} from "../validation";

// ===========================================================================
// Conversations
// ===========================================================================

export const createChatConversation = api(
  { expose: true, method: "POST", path: "/chat/conversations", auth: true },
  async (
    request: CreateConversationRequest
  ): Promise<CreateConversationResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // The orchestrator handles the rest: rider fetch, participant resolution,
    // transactional inserts, post-commit publish.
    return await createConversation({
      ...request,
      organizationId,
      creatorMemberId: member.id,
    });
  }
);

// ===========================================================================
// Messages
// ===========================================================================

export const sendMessage = api(
  {
    expose: true,
    method: "POST",
    path: "/chat/conversations/:conversationId/messages",
    auth: true,
  },
  async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();
    const { conversationId, ...body } = request;

    // Authz: must be an active participant
    await chatRepo.requireActiveParticipant(conversationId, member.id);

    // Tenancy check
    await chatRepo.findOneConversationScalar(conversationId, organizationId);

    // Validate attachment shape (matches validateMessageBody in chat.service.ts).
    // We duplicate inline rather than exporting validateMessageBody because
    // sendMessage doesn't go through the orchestrator — the conversation
    // already exists, no cross-service rider fetch needed.
    validateMessageBody(body);

    // Confirm referenced lesson exists in this org
    if (
      request.attachmentType === MessageAttachmentType.LESSON_REFERENCE &&
      request.attachmentId
    ) {
      await lessons.getLessonInstance({ id: request.attachmentId });
    }

    // Determine the response target rider for direct chats — always the
    // conversation's subject rider. Group chats (v2) will take it from
    // request.forRiderId.
    const conversation = await chatRepo.findOneConversation(
      request.conversationId,
      organizationId
    );
    const subjectRiderIds = conversation.subjectRiders.map((sr) => sr.riderId);
    if (subjectRiderIds.length !== 1) {
      throw APIError.failedPrecondition(
        "v1 expects exactly one subject rider per conversation"
      );
    }
    const forRiderId = request.forRiderId ?? subjectRiderIds[0];

    // Insert message + (if needed) response row in a transaction.
    const now = new Date();
    const messageId = await db.transaction(async (tx) => {
      const chats = createChatRepo(tx);

      const message = await chats.createMessage({
        conversationId,
        senderId: member.id,
        body: body.body ?? null,
        attachmentType: body.attachmentType ?? null,
        attachmentId: body.attachmentId ?? null,
        attachmentMetadata: body.attachmentMetadata ?? null,
        createdAt: now,
      });

      await chats.touchConversationLastMessageAt(conversationId, now);

      if (attachmentExpectsResponse(body.attachmentType ?? null)) {
        await chats.createMessageResponse({
          messageId: message.id,
          forRiderId,
          status: MessageResponseStatus.PENDING,
        });
      }

      return message.id;
    });

    // Post-commit publish
    await publishChatMessageCreated({
      messageId,
      conversationId: request.conversationId,
      organizationId,
      senderId: member.id,
      createdAt: now,
    });

    // Reload with relations for the response
    const message = await chatRepo.findOneMessage(messageId);
    return { message: toMessage(message) };
  }
);

export const updateMessage = api(
  {
    expose: true,
    method: "PATCH",
    path: "/chat/messages/:messageId",
    auth: true,
  },
  async (request: UpdateMessageRequest): Promise<SendMessageResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Sender-only edit. Load the message first to authz-check.
    const existing = await chatRepo.findOneMessageScalar(request.messageId);

    if (existing.senderId !== member.id) {
      throw APIError.permissionDenied("Only the sender can edit this message");
    }
    if (existing.deletedAt) {
      throw APIError.failedPrecondition("Cannot edit a deleted message");
    }

    // Tenancy check via conversation
    await chatRepo.findOneConversationScalar(
      existing.conversationId,
      organizationId
    );

    // Edits are body-only. Attachments are immutable post-send — if the
    // sender wants to change an attachment, they delete and resend.
    const now = new Date();
    await chatRepo.updateMessage(request.messageId, {
      body: request.body,
      editedAt: now,
    });

    await publishChatMessageUpdated({
      messageId: request.messageId,
      conversationId: existing.conversationId,
      organizationId,
      changeKind: "edited",
      updatedAt: now,
    });

    const reloaded = await chatRepo.findOneMessage(request.messageId);
    return { message: toMessage(reloaded) };
  }
);

export const deleteMessage = api(
  {
    expose: true,
    method: "DELETE",
    path: "/chat/messages/:messageId",
    auth: true,
  },
  async ({ messageId }: { messageId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const existing = await chatRepo.findOneMessageScalar(messageId);

    if (existing.senderId !== member.id) {
      throw APIError.permissionDenied(
        "Only the sender can delete this message"
      );
    }
    if (existing.deletedAt) {
      // Idempotent — already deleted, no-op
      return;
    }

    await chatRepo.findOneConversationScalar(
      existing.conversationId,
      organizationId
    );

    await chatRepo.softDeleteMessage(messageId);

    await publishChatMessageUpdated({
      messageId,
      conversationId: existing.conversationId,
      organizationId,
      changeKind: "deleted",
      updatedAt: new Date(),
    });
  }
);

export const markConversationRead = api(
  {
    expose: true,
    method: "POST",
    path: "/chat/conversations/:conversationId/read",
    auth: true,
  },
  async (request: MarkConversationReadRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Authz + tenancy
    await chatRepo.requireActiveParticipant(request.conversationId, member.id);
    await chatRepo.findOneConversationScalar(
      request.conversationId,
      organizationId
    );

    // Confirm the message belongs to this conversation
    const message = await chatRepo.findOneMessageScalar(request.upToMessageId);
    if (message.conversationId !== request.conversationId) {
      throw APIError.invalidArgument(
        "Message does not belong to this conversation"
      );
    }

    await chatRepo.markParticipantRead(
      request.conversationId,
      member.id,
      request.upToMessageId
    );

    // No publish here — read receipts are personal state, not broadcast.
    // (Could be added later as a presence-style feature.)
  }
);

// ===========================================================================
// Message responses (lesson invitation accept/decline/cancel)
// ===========================================================================

export const respondToChatMessage = api(
  {
    expose: true,
    method: "POST",
    path: "/chat/messages/:messageId/respond",
    auth: true,
  },
  async (
    request: RespondToMessageRequest
  ): Promise<RespondToMessageResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Authz: the responder must be the targeted rider OR a guardian of
    // the targeted rider.
    const response = await chatRepo.findOneMessageResponse(request.messageId);
    if (!response) {
      throw APIError.notFound("No response expected for this message");
    }

    await assertCanRespond({
      forRiderId: response.forRiderId,
      responderMemberId: member.id,
      organizationId,
    });

    // Tenancy check via the message's conversation
    const message = await chatRepo.findOneMessageScalar(request.messageId);
    await chatRepo.findOneConversationScalar(
      message.conversationId,
      organizationId
    );

    return await respondToMessage({
      organizationId,
      messageId: request.messageId,
      responderMemberId: member.id,
      action: request.action,
    });
  }
);

export const cancelChatMessageResponse = api(
  {
    expose: true,
    method: "POST",
    path: "/chat/messages/:messageId/cancel-response",
    auth: true,
  },
  async (
    request: CancelMessageResponseRequest
  ): Promise<RespondToMessageResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Authz: only the original sender can cancel
    const message = await chatRepo.findOneMessageScalar(request.messageId);
    if (message.senderId !== member.id) {
      throw APIError.permissionDenied(
        "Only the sender can cancel this response"
      );
    }
    await chatRepo.findOneConversationScalar(
      message.conversationId,
      organizationId
    );

    return await cancelMessageResponse({
      organizationId,
      messageId: request.messageId,
    });
  }
);
