import { defineRelationsPart } from "drizzle-orm/relations";

import * as schema from "@/database/schema";

export const chatRelations = defineRelationsPart(schema, (r) => ({
  conversations: {
    organization: r.one.organizations({
      from: r.conversations.organizationId,
      to: r.organizations.id,
    }),
    creator: r.one.members({
      from: r.conversations.createdBy,
      to: r.members.id,
    }),
    subjectRiders: r.many.conversationSubjectRiders({
      from: r.conversations.id,
      to: r.conversationSubjectRiders.conversationId,
    }),
    activeParticipants: r.many.conversationParticipants({
      from: r.conversations.id,
      to: r.conversationParticipants.conversationId,
      where: {
        leftAt: {
          isNull: true,
        },
      },
    }),
    activeMessages: r.many.messages({
      from: r.conversations.id,
      to: r.messages.conversationId,
      where: {
        deletedAt: {
          isNull: true,
        },
      },
    }),
  },
  conversationSubjectRiders: {
    conversation: r.one.conversations({
      from: r.conversationSubjectRiders.conversationId,
      to: r.conversations.id,
    }),
    rider: r.one.riders({
      from: r.conversationSubjectRiders.riderId,
      to: r.riders.id,
    }),
  },
  conversationParticipants: {
    conversation: r.one.conversations({
      from: r.conversationParticipants.conversationId,
      to: r.conversations.id,
    }),
    member: r.one.members({
      from: r.conversationParticipants.memberId,
      to: r.members.id,
    }),
    lastReadMessage: r.one.messages({
      from: r.conversationParticipants.lastReadMessageId,
      to: r.messages.id,
    }),
  },
  messages: {
    conversation: r.one.conversations({
      from: r.messages.conversationId,
      to: r.conversations.id,
    }),
    sender: r.one.members({
      from: r.messages.senderId,
      to: r.members.id,
    }),
    referencedLessonInstance: r.one.lessonInstances({
      from: r.messages.attachmentId,
      to: r.lessonInstances.id,
    }),
    response: r.one.messageResponses({
      from: r.messages.id,
      to: r.messageResponses.messageId,
    }),
  },
  messageResponses: {
    message: r.one.messages({
      from: r.messageResponses.messageId,
      to: r.messages.id,
    }),
    forRider: r.one.riders({
      from: r.messageResponses.forRiderId,
      to: r.riders.id,
    }),
    responder: r.one.members({
      from: r.messageResponses.respondedBy,
      to: r.members.id,
    }),
  },
}));
