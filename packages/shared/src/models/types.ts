import { MessageResponseStatus } from "./enums";

export interface FeedCursor {
  createdAt: string;
  id: string;
}

export interface GuardianPermissions {
  bookings: {
    canBookLessons: boolean;
    canJoinEvents: boolean;
    requiresApproval: boolean;
    canCancel: boolean;
  };
  communication: {
    canPost: boolean;
    canComment: boolean;
    receiveEmailNotifications: boolean;
    receiveTextNotifications: boolean;
  };
  profile: {
    canEdit: boolean;
  };
}

export const TERMINAL_RESPONSE_STATUSES: ReadonlySet<MessageResponseStatus> =
  new Set([
    MessageResponseStatus.ACCEPTED,
    MessageResponseStatus.DECLINED,
    MessageResponseStatus.CANCELLED,
    MessageResponseStatus.FAILED,
  ]);
