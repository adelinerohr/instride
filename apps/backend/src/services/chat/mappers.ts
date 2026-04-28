import type {
  Conversation,
  ConversationParticipant,
  ConversationSummary,
  Message,
  MessageResponse,
} from "@instride/api/contracts";

import type { LessonInstanceRow } from "@/services/lessons/schema";
import {
  RiderWithExpansionRow,
  MemberSummaryRow,
  toMemberSummary,
  toRiderSummary,
} from "@/services/organizations/mappers";
import { toISO, toISOOrNull, toTimestamps } from "@/shared/utils/mappers";
import { assertExists } from "@/shared/utils/validation";

import {
  LessonInstanceWithExpansionRow,
  toLessonInstance,
} from "../lessons/mappers";
import type {
  ConversationParticipantRow,
  ConversationRow,
  ConversationSubjectRiderRow,
  MessageResponseRow,
  MessageRow,
} from "./schema";

// ---------------------------------------------------------------------------
// Augmented row types (row + relations as fetched via fragments)
// ---------------------------------------------------------------------------

export type MessageResponseWithExpansionRow = MessageResponseRow & {
  forRider: RiderWithExpansionRow | null;
  responder: MemberSummaryRow | null;
};

type MessageWithRelations = MessageRow & {
  sender: MemberSummaryRow | null;
  referencedLessonInstance: LessonInstanceRow | null;
  response: MessageResponseWithExpansionRow | null;
};

export type ParticipantWithExpansionRow = ConversationParticipantRow & {
  member: MemberSummaryRow | null;
};

type SubjectRiderWithRider = ConversationSubjectRiderRow & {
  rider: RiderWithExpansionRow | null;
};

export type ConversationWithExpansionRow = ConversationRow & {
  subjectRiders: SubjectRiderWithRider[];
  activeParticipants: ParticipantWithExpansionRow[];
};

export type MessageWithExpansionRow = MessageWithRelations & {
  sender: MemberSummaryRow | null;
  referencedLessonInstance: LessonInstanceWithExpansionRow | null;
  response: Parameters<typeof toMessageResponse>[0] | null;
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function toMessageResponse(
  row: MessageResponseWithExpansionRow
): MessageResponse {
  assertExists(row.forRider, "Response has no forRider");
  return {
    messageId: row.messageId,
    forRiderId: row.forRiderId,
    status: row.status,
    respondedBy: row.respondedBy,
    respondedAt: toISOOrNull(row.respondedAt),
    resultEnrollmentId: row.resultEnrollmentId,
    resultLessonInstanceId: row.resultLessonInstanceId,
    failureReason: row.failureReason,
    forRider: toRiderSummary(row.forRider),
    responder: row.responder ? toMemberSummary(row.responder) : null,
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toMessage(row: MessageWithExpansionRow): Message {
  assertExists(row.sender, "Message has no sender");
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    body: row.body,
    attachmentType: row.attachmentType,
    attachmentId: row.attachmentId,
    attachmentMetadata: row.attachmentMetadata,
    createdAt: toISO(row.createdAt),
    editedAt: toISOOrNull(row.editedAt),
    sender: toMemberSummary(row.sender),
    referencedLessonInstance: row.referencedLessonInstance
      ? toLessonInstance(row.referencedLessonInstance)
      : null,
    response: row.response ? toMessageResponse(row.response) : null,
    deletedAt: toISOOrNull(row.deletedAt),
  };
}

export function toConversationParticipant(
  row: ParticipantWithExpansionRow
): ConversationParticipant {
  assertExists(row.member, "Participant has no member");
  return {
    conversationId: row.conversationId,
    memberId: row.memberId,
    role: row.role,
    joinedAt: toISO(row.joinedAt),
    lastReadMessageId: row.lastReadMessageId,
    mutedAt: toISOOrNull(row.mutedAt),
    leftAt: toISOOrNull(row.leftAt),
    member: toMemberSummary(row.member),
  };
}

export function toConversation(
  row: ConversationWithExpansionRow
): Conversation {
  return {
    id: row.id,
    organizationId: row.organizationId,
    type: row.type,
    title: row.title,
    createdBy: row.createdBy,
    lastMessageAt: toISOOrNull(row.lastMessageAt),
    subjectRiders: row.subjectRiders.map((sr) => {
      assertExists(sr.rider, "Subject rider row missing rider");
      return toRiderSummary(sr.rider);
    }),
    activeParticipants: row.activeParticipants.map(toConversationParticipant),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

/**
 * Conversation summary mapper. Takes the same row shape as toConversation
 * plus the resolved lastMessage and unreadCount, which the service layer
 * computes separately (not via Drizzle relation expansion).
 */
export function toConversationSummary(
  row: ConversationWithExpansionRow,
  extras: {
    lastMessage: MessageWithExpansionRow | null;
    unreadCount: number;
  }
): ConversationSummary {
  return {
    ...toConversation(row),
    lastMessage: extras.lastMessage ? toMessage(extras.lastMessage) : null,
    unreadCount: extras.unreadCount,
  };
}
