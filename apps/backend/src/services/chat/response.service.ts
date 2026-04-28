import {
  LessonProposalPayload,
  MessageResponse,
  RespondToMessageResponse,
} from "@instride/api/contracts";
import {
  MessageAttachmentType,
  MessageResponseStatus,
  riderCreateLessonInputSchema,
} from "@instride/shared";
import { APIError, ErrCode } from "encore.dev/api";
import log from "encore.dev/log";
import { boards, lessons } from "~encore/clients";

import { assertExists } from "@/shared/utils/validation";

import { lessonInstanceRepo } from "../lessons/instances/instance.repo";
import { chatRepo, createChatRepo } from "./chat.repo";
import { db } from "./db";
import { toMessageResponse } from "./mappers";
import { publishChatResponseUpdated } from "./publish";
import {
  mapEnrollmentError,
  mapSeriesCreateError,
  markFailed,
  throwIfTerminal,
} from "./utils";

// State machine for message_responses. Handles the accept/decline flows
// for actionable message attachments (lesson_reference, lesson_proposal).
//
// The accept path is a saga:
//
//   pending ──[atomic CAS]──▶ processing
//                              │
//                              ▼
//                  call into lessons / enrollments
//                              │
//                ┌─────────────┴──────────────┐
//                ▼                            ▼
//            success                       failure
//                │                            │
//                ▼                            ▼
//          accepted                       failed
//        (resultEnrollmentId        (failureReason set)
//         or resultLessonInstanceId)
//
// The intermediate `processing` state is what makes this safe under
// concurrent clicks: the CAS update (`UPDATE ... WHERE status='pending'`)
// can succeed on at most one caller. The losing caller sees the row in
// `processing` (or a terminal state) and surfaces a "already responded"
// error.
//
// Decline and cancel are simple terminal transitions with no external
// effects, but go through the same CAS pattern for symmetry and so the
// "already responded" race is handled identically.

interface RespondToMessageParams {
  organizationId: string;
  messageId: string;
  /**
   * The member acting on the response. Must be authorized to respond on
   * behalf of the targeted rider — that authz check is the API layer's
   * responsibility, not the saga's.
   */
  responderMemberId: string;
  action: "accept" | "decline";
}

export async function respondToMessage(
  params: RespondToMessageParams
): Promise<RespondToMessageResponse> {
  if (params.action === "decline") {
    return await declineMessage(params);
  }
  return await acceptMessage(params);
}

export async function cancelMessageResponse(params: {
  organizationId: string;
  messageId: string;
}): Promise<RespondToMessageResponse> {
  const chats = createChatRepo();

  const updated = await chats.transitionMessageResponseStatus(
    params.messageId,
    MessageResponseStatus.PENDING,
    MessageResponseStatus.CANCELLED
  );

  if (!updated) {
    await throwIfTerminal(params.messageId);
    throw APIError.failedPrecondition("Response is not pending");
  }

  const fullResponse = await chats.findOneMessageResponse(params.messageId);
  assertExists(fullResponse, "Response not found");

  return { response: toMessageResponse(fullResponse) };
}

export async function declineMessage(
  params: RespondToMessageParams
): Promise<RespondToMessageResponse> {
  const chats = createChatRepo();

  const updated = await chats.transitionMessageResponseStatus(
    params.messageId,
    MessageResponseStatus.PENDING,
    MessageResponseStatus.DECLINED,
    {
      respondedBy: params.responderMemberId,
      respondedAt: new Date(),
    }
  );

  if (!updated) {
    await throwIfTerminal(params.messageId);
    throw APIError.failedPrecondition("Response is not pending");
  }

  const fullResponse = await chats.findOneMessageResponse(params.messageId);
  assertExists(fullResponse, "Response not found");

  return { response: toMessageResponse(fullResponse) };
}

export async function acceptLessonReference(input: {
  chats: ReturnType<typeof createChatRepo>;
  params: RespondToMessageParams;
  lessonInstanceId: string;
  forRiderId: string;
  organizationId: string;
}): Promise<RespondToMessageResponse> {
  const { chats, params } = input;

  let enrollmentId: string;
  try {
    // Cross-service call. enrollInInstance is the exposed HTTP endpoint
    // that wraps the internal enrollRidersInInstance with idempotent: false.
    // We pass a single-rider array; the endpoint returns enrollments[]
    // with one element on success.
    //
    // Auth note: Encore propagates the caller's auth context across
    // ~encore/clients calls automatically. The user who clicked "accept"
    // in chat is the same user enrolling — same authz that would apply
    // to a direct enrollment call.
    const result = await lessons.enrollInInstance({
      instanceId: input.lessonInstanceId,
      riderIds: [input.forRiderId],
      enrolledByMemberId: params.responderMemberId,
    });

    if (result.enrollments.length === 0) {
      // Defensive — should never happen for a successful single-rider call
      throw APIError.internal("Enrollment endpoint returned no enrollments");
    }
    enrollmentId = result.enrollments[0].id;
  } catch (error) {
    if (error instanceof APIError) {
      await markFailed(chats, params.messageId, mapEnrollmentError(error));
      return { response: await finishTransition(params.messageId) };
    }
    throw error;
  }

  // Mark the response accepted with the enrollment FK set.
  const accepted = await chats.transitionMessageResponseStatus(
    params.messageId,
    MessageResponseStatus.PROCESSING,
    MessageResponseStatus.ACCEPTED,
    { resultEnrollmentId: enrollmentId }
  );
  if (!accepted) {
    // We held the processing state, so this should never fail.
    log.error("Failed to transition processing → accepted", {
      messageId: params.messageId,
    });
    throw APIError.internal("Failed to mark response accepted");
  }

  return { response: await finishTransition(params.messageId) };
}

export async function acceptLessonProposal(input: {
  chats: ReturnType<typeof createChatRepo>;
  params: RespondToMessageParams;
  organizationId: string;
  proposal: LessonProposalPayload;
  forRiderId: string;
}): Promise<RespondToMessageResponse> {
  const parsed = riderCreateLessonInputSchema.safeParse(input.proposal);
  if (!parsed.success) {
    await markFailed(input.chats, input.params.messageId, "proposal_invalid");
    return { response: await finishTransition(input.params.messageId) };
  }

  let service;
  try {
    const result = await boards.getService({ id: input.proposal.serviceId });
    service = result.service;
  } catch (error) {
    if (error instanceof APIError && error.code === ErrCode.NotFound) {
      await markFailed(
        input.chats,
        input.params.messageId,
        "service_not_found"
      );
      return { response: await finishTransition(input.params.messageId) };
    }
    throw error;
  }

  let instance;
  try {
    const createResult = await lessons.createLessonSeries({
      isRecurring: false,
      recurrenceFrequency: null,
      recurrenceByDay: null,
      recurrenceEnd: null,
      start: input.proposal.start,
      duration: service.duration,
      maxRiders: service.maxRiders,
      trainerId: input.proposal.trainerId,
      boardId: input.proposal.boardId,
      serviceId: input.proposal.serviceId,
      levelId: null,
      name: null,
      notes: null,
      riderIds: [input.forRiderId],
    });

    const instances = await lessonInstanceRepo.findBySeries(
      createResult.series.id,
      input.organizationId
    );
    const singleInstance = instances[0];

    if (!instance) {
      try {
        await lessons.cancelLessonSeries({
          id: createResult.series.id,
          reason: "Lesson proposal couldn't materialize",
        });
      } catch (cleanupError) {
        log.error("Failed to clean up empty proposal series", {
          seriesId: createResult.series.id,
          error: cleanupError,
        });
      }

      const skipReason = createResult.skipped[0]?.reason ?? "slot_unavailable";
      await markFailed(input.chats, input.params.messageId, skipReason);
      return { response: await finishTransition(input.params.messageId) };
    }

    instance = singleInstance;
  } catch (error) {
    if (error instanceof APIError) {
      const reason = mapSeriesCreateError(error);
      await markFailed(input.chats, input.params.messageId, reason);
      return { response: await finishTransition(input.params.messageId) };
    }
  }

  const accepted = await input.chats.transitionMessageResponseStatus(
    input.params.messageId,
    MessageResponseStatus.PROCESSING,
    MessageResponseStatus.ACCEPTED,
    { resultLessonInstanceId: instance?.id }
  );

  if (!accepted) {
    log.error("Failed to transition processing → accepted", {
      messageId: input.params.messageId,
    });
    throw APIError.internal("Failed to mark response accepted");
  }

  return { response: await finishTransition(input.params.messageId) };
}

export async function acceptMessage(
  params: RespondToMessageParams
): Promise<RespondToMessageResponse> {
  const chats = createChatRepo();

  // ---- Step 1: claim the processing state atomically -----------------------

  const claimed = await chats.transitionMessageResponseStatus(
    params.messageId,
    MessageResponseStatus.PENDING,
    MessageResponseStatus.PROCESSING,
    {
      respondedBy: params.responderMemberId,
      respondedAt: new Date(),
    }
  );

  if (!claimed) {
    // Another caller got there first, or the response is already terminal.
    await throwIfTerminal(params.messageId);
    throw APIError.failedPrecondition("Response is not pending");
  }

  // ---- Step 2: load the message to dispatch on attachment type -------------

  const message = await chats.findOneMessage(params.messageId);

  // ---- Step 3: dispatch on attachment type ---------------------------------

  try {
    if (message.attachmentType === MessageAttachmentType.LESSON_REFERENCE) {
      return await acceptLessonReference({
        chats,
        params,
        lessonInstanceId: message.attachmentId!,
        forRiderId: claimed.forRiderId,
        organizationId: params.organizationId,
      });
    }

    if (message.attachmentType === MessageAttachmentType.LESSON_PROPOSAL) {
      const proposal = message.attachmentMetadata as LessonProposalPayload;
      return await acceptLessonProposal({
        chats,
        params,
        organizationId: params.organizationId,
        proposal,
        forRiderId: claimed.forRiderId,
      });
    }

    // Shouldn't happen — only response-bearing attachments get message_response rows.
    throw APIError.internal(
      `Unexpected attachment type for response: ${message.attachmentType}`
    );
  } catch (error) {
    // Any unexpected throw transitions the response to failed so the row
    // doesn't get stuck in `processing`. Re-throws after.
    await markFailed(
      chats,
      params.messageId,
      error instanceof APIError ? error.code : "internal"
    );
    throw error;
  }
}

/**
 * Convenience: load the response with relations AND publish the
 * response_updated event. Called at every terminal exit point of the
 * saga. The actual loading is needed by both the contract response and
 * the publish helper; combining them here ensures we never forget to
 * publish.
 */
const finishTransition = async (
  messageId: string
): Promise<MessageResponse> => {
  const response = await chatRepo.findOneMessageResponse(messageId);
  assertExists(response, "Response not found");

  // Get the conversationId for the topic. We have it via the message;
  // a single targeted query keeps this self-contained.
  const message = await db.query.messages.findFirst({
    where: { id: messageId },
    columns: { conversationId: true, deletedAt: true },
  });
  if (!message) {
    log.warn("finishTransition: message not found, skipping publish", {
      messageId,
    });
    return toMessageResponse(response);
  }

  // Look up organizationId via the conversation. Could be denormalized
  // onto message_responses if this becomes hot.
  const conversation = await db.query.conversations.findFirst({
    where: { id: message.conversationId },
    columns: { organizationId: true },
  });
  if (!conversation) {
    log.warn("finishTransition: conversation not found, skipping publish", {
      messageId,
      conversationId: message.conversationId,
    });
    return toMessageResponse(response);
  }

  await publishChatResponseUpdated({
    messageId,
    conversationId: message.conversationId,
    organizationId: conversation.organizationId,
    status: response.status,
    updatedAt: new Date(),
  });

  return toMessageResponse(response);
};
