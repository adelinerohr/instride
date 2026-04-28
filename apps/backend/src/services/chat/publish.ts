import { chatRepo } from "./chat.repo";
import {
  chatConversationUpdated,
  chatMessageCreated,
  chatMessageUpdated,
  chatResponseUpdated,
} from "./topics";

/**
 * Active participants of a conversation (haven't soft-left). Used to
 * compute recipientMemberIds for any chat event.
 *
 * Includes the actor — the user who sent the message also needs the
 * update on their other devices. The stream layer's per-connection check
 * filters out only the originating connection, not all of the actor's
 * other connections.
 */
export async function resolveRecipients(
  conversationId: string,
  organizationId: string
): Promise<string[]> {
  const conversation = await chatRepo.findOneConversation(
    conversationId,
    organizationId
  );
  return conversation.activeParticipants
    .filter((p) => p.leftAt === null)
    .map((p) => p.memberId);
}

export async function publishChatMessageCreated(input: {
  messageId: string;
  conversationId: string;
  organizationId: string;
  senderId: string;
  createdAt: Date;
}): Promise<void> {
  const recipientMemberIds = await resolveRecipients(
    input.conversationId,
    input.organizationId
  );
  await chatMessageCreated.publish({
    messageId: input.messageId,
    conversationId: input.conversationId,
    organizationId: input.organizationId,
    senderId: input.senderId,
    recipientMemberIds,
    createdAt: input.createdAt.toISOString(),
  });
}

export async function publishChatMessageUpdated(input: {
  messageId: string;
  conversationId: string;
  organizationId: string;
  changeKind: "edited" | "deleted";
  updatedAt: Date;
}): Promise<void> {
  const recipientMemberIds = await resolveRecipients(
    input.conversationId,
    input.organizationId
  );
  await chatMessageUpdated.publish({
    messageId: input.messageId,
    conversationId: input.conversationId,
    organizationId: input.organizationId,
    recipientMemberIds,
    changeKind: input.changeKind,
    updatedAt: input.updatedAt.toISOString(),
  });
}

export async function publishChatResponseUpdated(input: {
  messageId: string;
  conversationId: string;
  organizationId: string;
  status: string;
  updatedAt: Date;
}): Promise<void> {
  const recipientMemberIds = await resolveRecipients(
    input.conversationId,
    input.organizationId
  );
  await chatResponseUpdated.publish({
    messageId: input.messageId,
    conversationId: input.conversationId,
    organizationId: input.organizationId,
    recipientMemberIds,
    status: input.status,
    updatedAt: input.updatedAt.toISOString(),
  });
}

export async function publishChatConversationUpdated(input: {
  conversationId: string;
  organizationId: string;
  changeKind: "created" | "participants_changed" | "metadata_changed";
  updatedAt: Date;
}): Promise<void> {
  const recipientMemberIds = await resolveRecipients(
    input.conversationId,
    input.organizationId
  );
  await chatConversationUpdated.publish({
    conversationId: input.conversationId,
    organizationId: input.organizationId,
    recipientMemberIds,
    changeKind: input.changeKind,
    updatedAt: input.updatedAt.toISOString(),
  });
}
