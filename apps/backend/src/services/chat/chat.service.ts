import { CreateConversationRequest } from "@instride/api/contracts";
import { ConversationType, MessageResponseStatus } from "@instride/shared";
import { APIError } from "encore.dev/api";

import { createGuardianRepo } from "../guardians/guardian.repo";
import { createLessonInstanceRepo } from "../lessons/instances/instance.repo";
import { createMemberRepo } from "../organizations/members/member.repo";
import { chatRepo, createChatRepo } from "./chat.repo";
import { db } from "./db";
import { toConversation, toMessage } from "./mappers";
import {
  resolveParticipantsForRider,
  ResolverGuardianRelationship,
  ResolverRider,
} from "./participant-resolver";
import {
  publishChatConversationUpdated,
  publishChatMessageCreated,
} from "./publish";
import {
  attachmentExpectsResponse,
  validateAttachment,
  validateMessageBody,
} from "./validation";

export async function createConversation(
  params: CreateConversationRequest & {
    organizationId: string;
    creatorMemberId: string;
  }
) {
  if (params.subjectRiderIds.length !== 1) {
    // v1 only supports direct chats
    throw APIError.invalidArgument(
      "Direct chat must have exactly one subject rider"
    );
  }

  const [subjectRiderId] = params.subjectRiderIds;

  if (params.initialMessage) {
    validateMessageBody(params.initialMessage);
  }

  const { conversationId, initialMessageId } = await db.transaction(
    async (tx) => {
      const chats = createChatRepo(tx);
      const members = createMemberRepo(tx);
      const guardians = createGuardianRepo(tx);

      const rider = await members.findOneRider(
        subjectRiderId,
        params.organizationId
      );
      const guardianRelationships =
        await guardians.findRelationshipsByDependent(
          rider.memberId,
          params.organizationId
        );

      const resolverRider: ResolverRider = {
        id: rider.id,
        memberId: rider.memberId,
        isRestricted: rider.isRestricted,
        isPlaceholder: rider.member.isPlaceholder,
      };

      const resolverGuardianRelationships: ResolverGuardianRelationship[] =
        guardianRelationships.map((relationship) => ({
          guardianMemberId: relationship.guardianMemberId,
        }));

      // Creator is always a staff participant; additional staff members can
      // be requested but the creator is not optional.
      const staffMemberIds = Array.from(
        new Set([params.creatorMemberId, ...(params.staffMemberIds ?? [])])
      );

      const resolvedParticipants = resolveParticipantsForRider({
        rider: resolverRider,
        guardianRelationships: resolverGuardianRelationships,
        staffMemberIds,
      });

      if (params.initialMessage) {
        await validateAttachment({
          lessons: createLessonInstanceRepo(tx),
          organizationId: params.organizationId,
          body: params.initialMessage,
        });
      }

      // -- Create the conversation row -----------------------------------------

      const conversation = await chats.createConversation({
        organizationId: params.organizationId,
        type: ConversationType.DIRECT,
        title: params.title ?? null,
        createdBy: params.creatorMemberId,
      });

      // -- Subject riders ------------------------------------------------------

      await chats.addSubjectRiders(
        params.subjectRiderIds.map((riderId) => ({
          conversationId: conversation.id,
          riderId,
        }))
      );

      // -- Participants --------------------------------------------------------

      await chats.addParticipants(
        resolvedParticipants.map((participant) => ({
          conversationId: conversation.id,
          memberId: participant.memberId,
          role: participant.role,
        }))
      );

      // -- Initial message (optional) -------------------------------------------

      let initialMessageId: string | null = null;
      if (params.initialMessage) {
        await validateAttachment({
          lessons: createLessonInstanceRepo(tx),
          organizationId: params.organizationId,
          body: params.initialMessage,
        });

        const now = new Date();

        // -- Insert the message row ---------------------------------------------

        const message = await chats.createMessage({
          conversationId: conversation.id,
          senderId: params.creatorMemberId,
          body: params.initialMessage.body ?? null,
          attachmentType: params.initialMessage.attachmentType ?? null,
          attachmentId: params.initialMessage.attachmentId ?? null,
          attachmentMetadata: params.initialMessage.attachmentMetadata ?? null,
          createdAt: now,
        });

        // -- Touch lastMessageAt ------------------------------------------------

        await chats.touchConversationLastMessageAt(conversation.id, now);

        // -- Create response row if the attachment expects a response -----------

        if (
          attachmentExpectsResponse(
            params.initialMessage.attachmentType ?? null
          )
        ) {
          await chats.createMessageResponse({
            messageId: message.id,
            // For direct chats, forRiderId === subject rider.
            // For group chats (v2), the sender will specify body.forRiderId
            // and the orchestrator will use that here.
            forRiderId: params.initialMessage.forRiderId ?? subjectRiderId,
            status: MessageResponseStatus.PENDING,
          });
        }

        initialMessageId = message.id;
      }

      return { conversationId: conversation.id, initialMessageId };
    }
  );

  // ---- After commit: publish events + reload for response -----------------

  await publishChatConversationUpdated({
    conversationId,
    organizationId: params.organizationId,
    changeKind: "created",
    updatedAt: new Date(),
  });

  if (initialMessageId) {
    await publishChatMessageCreated({
      messageId: initialMessageId,
      conversationId,
      organizationId: params.organizationId,
      senderId: params.creatorMemberId,
      createdAt: new Date(),
    });
  }

  // -- Reload conversation with relations for the contract -----------------

  const fullConversation = await chatRepo.findOneConversation(
    conversationId,
    params.organizationId
  );

  const initialMessage = initialMessageId
    ? toMessage(await chatRepo.findOneMessage(initialMessageId))
    : null;

  return {
    conversation: toConversation(fullConversation),
    initialMessage,
  };
}
