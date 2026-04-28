// packages/api/src/contracts/chats.ts

import type {
  ConversationParticipantRole,
  ConversationType,
  MessageAttachmentType,
  MessageResponseStatus,
} from "@instride/shared";

import { LessonInstance } from "./lessons";
import type { MemberSummary, RiderSummary } from "./organizations";

// ============================================================================
// Attachment payloads
// ============================================================================

/**
 * The shape stored in messages.attachmentMetadata when attachmentType is
 * 'lesson_proposal'. Mirrored as a Zod schema in @instride/shared/schemas/chats
 * for write-time validation.
 *
 * IMPORTANT: keep aligned with the input contract of `lessons.create`.
 */
export interface LessonProposalPayload {
  boardId: string;
  serviceId: string;
  trainerId: string;
  start: string;
  riderId: string;
  acknowledgePrivateLesson: boolean;
}

// ============================================================================
// Entities
// ============================================================================

export interface MessageResponse {
  messageId: string;
  forRiderId: string;
  status: MessageResponseStatus;
  respondedBy: string | null;
  respondedAt: string | null;
  resultEnrollmentId: string | null;
  resultLessonInstanceId: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  forRider: RiderSummary;
  responder: MemberSummary | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  attachmentType: MessageAttachmentType | null;
  attachmentId: string | null;
  attachmentMetadata: LessonProposalPayload | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  sender: MemberSummary;
  // Set when attachmentType = 'lesson_reference'
  referencedLessonInstance: LessonInstance | null;
  // Set when the message expects a yes/no response
  response: MessageResponse | null;
}

export interface ConversationParticipant {
  conversationId: string;
  memberId: string;
  role: ConversationParticipantRole;
  joinedAt: string;
  lastReadMessageId: string | null;
  mutedAt: string | null;
  leftAt: string | null;
  member: MemberSummary;
}

/**
 * Lightweight conversation, no messages. Used for the inbox list.
 */
export interface ConversationSummary {
  id: string;
  organizationId: string;
  type: ConversationType;
  title: string | null;
  createdBy: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  subjectRiders: RiderSummary[];
  activeParticipants: ConversationParticipant[];
  lastMessage: Message | null;
  // The current viewer's unread count. Computed per-request.
  unreadCount: number;
}

/**
 * Full conversation with messages. Used for the conversation detail view.
 * Messages are paginated separately via listMessages — this returns the
 * most recent page (or empty if loaded lazily).
 */
export interface Conversation {
  id: string;
  organizationId: string;
  type: ConversationType;
  title: string | null;
  createdBy: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  subjectRiders: RiderSummary[];
  activeParticipants: ConversationParticipant[];
}

// ============================================================================
// Requests + responses
// ============================================================================

/**
 * Create a new conversation. If `initialMessage` is provided, the message
 * is created in the same transaction. Standard chat-product behavior.
 */
export interface CreateConversationRequest {
  // For v1, exactly one rider. Group chats (v2) will accept multiple.
  subjectRiderIds: string[];
  // Additional staff to include beyond the creator. Creator is auto-added.
  staffMemberIds?: string[];
  title?: string | null;
  initialMessage?: SendMessageBody;
}

export interface SendMessageBody {
  body?: string | null;
  attachmentType?: MessageAttachmentType | null;
  // Required when attachmentType = 'lesson_reference'
  attachmentId?: string | null;
  // Required when attachmentType = 'lesson_proposal'
  attachmentMetadata?: LessonProposalPayload | null;
  // Required when the attachment expects a response. The rider this
  // message is targeted at; for direct chats this is always the subject rider.
  forRiderId?: string | null;
}

export interface SendMessageRequest extends SendMessageBody {
  conversationId: string;
}

export interface UpdateMessageRequest {
  messageId: string;
  body: string;
}

export interface MarkConversationReadRequest {
  conversationId: string;
  upToMessageId: string;
}

export interface RespondToMessageRequest {
  messageId: string;
  action: "accept" | "decline";
}

export interface CancelMessageResponseRequest {
  messageId: string;
}

export interface ListConversationsRequest {
  // Pagination is light here — most users have <50 conversations.
  // Add cursor if it becomes a hot path.
  limit?: number;
}

export interface ListMessagesRequest {
  conversationId: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

export interface ListConversationsResponse {
  conversations: ConversationSummary[];
}

export interface GetConversationResponse {
  conversation: Conversation;
}

export interface ListMessagesResponse {
  messages: Message[];
  nextCursor: { createdAt: string; id: string } | null;
  hasMore: boolean;
}

export interface SendMessageResponse {
  message: Message;
}

export interface CreateConversationResponse {
  conversation: Conversation;
  initialMessage: Message | null;
}

export interface RespondToMessageResponse {
  response: MessageResponse;
}
