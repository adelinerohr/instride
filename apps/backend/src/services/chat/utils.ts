import {
  MessageResponseStatus,
  TERMINAL_RESPONSE_STATUSES,
} from "@instride/shared";
import { APIError, ErrCode } from "encore.dev/api";
import log from "encore.dev/log";

import { createChatRepo } from "./chat.repo";

/**
 * Inspect the response and throw a descriptive error if it's already in a
 * terminal state. Used when CAS fails so the caller gets a helpful error
 * rather than the bare "not pending" message.
 */
export const throwIfTerminal = async (messageId: string): Promise<void> => {
  const chats = createChatRepo();
  const response = await chats.findOneMessageResponse(messageId);
  if (!response) {
    throw APIError.notFound("Response not found");
  }
  if (TERMINAL_RESPONSE_STATUSES.has(response.status)) {
    throw APIError.failedPrecondition(`Response already ${response.status}`);
  }
  if (response.status === MessageResponseStatus.PROCESSING) {
    throw APIError.failedPrecondition(
      "Response is being processed by another request"
    );
  }
};

export const markFailed = async (
  chats: ReturnType<typeof createChatRepo>,
  messageId: string,
  failureReason: string
): Promise<void> => {
  const failed = await chats.transitionMessageResponseStatus(
    messageId,
    MessageResponseStatus.PROCESSING,
    MessageResponseStatus.FAILED,
    { failureReason }
  );
  if (!failed) {
    log.error("Failed to mark response as failed", { messageId });
    // Don't throw here — the original error is what the caller cares about.
  }
};

export /**
 * Map APIError codes from enrollment failures into the canonical
 * failureReason string stored in message_responses.failure_reason.
 *
 * The enrollments service's error codes are the source of truth here.
 * When that service grows new codes, add cases below.
 */
const mapEnrollmentError = (error: APIError): string => {
  switch (error.code) {
    case ErrCode.FailedPrecondition:
      // Most enrollment business-rule rejections come through here.
      // Pass the message through so it's debuggable without remapping.
      return `enrollment_rejected: ${error.message}`;
    case ErrCode.NotFound:
      return "lesson_not_found";
    case ErrCode.PermissionDenied:
      return "rider_ineligible";
    default:
      return `enrollment_error: ${error.code}`;
  }
};

export const mapLessonsError = (error: APIError): string => {
  switch (error.code) {
    case ErrCode.FailedPrecondition:
      return `lesson_create_rejected: ${error.message}`;
    default:
      return `lesson_create_error: ${error.code}`;
  }
};

export const mapSeriesCreateError = (error: APIError): string => {
  switch (error.code) {
    case "invalid_argument":
      // Most likely: availability conflict (createLessonSeries throws this
      // when the slot is taken). The withDetails().violations would have
      // specifics, but for a stable string we just label it.
      return `slot_unavailable: ${error.message}`;
    case "not_found":
      // Trainer, board, or service deleted between propose and accept.
      return "lesson_resource_not_found";
    case "permission_denied":
      return "permission_denied";
    default:
      return `lesson_create_error: ${error.code}`;
  }
};
