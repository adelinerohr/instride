import { SendMessageBody } from "@instride/api/contracts";
import {
  MessageAttachmentType,
  riderCreateLessonInputSchema,
} from "@instride/shared";
import { APIError } from "encore.dev/api";

import { guardianRepo } from "../guardians/guardian.repo";
import { createLessonInstanceRepo } from "../lessons/instances/instance.repo";
import { memberRepo } from "../organizations/members/member.repo";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Cheap validation that doesn't touch the DB. Catches obvious shape errors
 * before opening a transaction.
 */
export const validateMessageBody = (body: SendMessageBody): void => {
  // Must have content.
  if (!body.body && !body.attachmentType) {
    throw APIError.invalidArgument(
      "Message must have body, attachment, or both"
    );
  }

  // Discriminator must match payload shape.
  if (body.attachmentType === MessageAttachmentType.LESSON_REFERENCE) {
    if (!body.attachmentId) {
      throw APIError.invalidArgument("lesson_reference requires attachmentId");
    }
    if (body.attachmentMetadata) {
      throw APIError.invalidArgument(
        "lesson_reference must not include attachmentMetadata"
      );
    }
  } else if (body.attachmentType === MessageAttachmentType.LESSON_PROPOSAL) {
    if (body.attachmentId) {
      throw APIError.invalidArgument(
        "lesson_proposal must not include attachmentId"
      );
    }
    if (!body.attachmentMetadata) {
      throw APIError.invalidArgument(
        "lesson_proposal requires attachmentMetadata"
      );
    }
    // Validate the proposal payload structure.
    const parsed = riderCreateLessonInputSchema.safeParse(
      body.attachmentMetadata
    );
    if (!parsed.success) {
      throw APIError.invalidArgument(
        `lesson_proposal payload invalid: ${parsed.error.message}`
      );
    }
  } else if (body.attachmentType) {
    throw APIError.invalidArgument(
      `Unknown attachment type: ${body.attachmentType}`
    );
  } else if (body.attachmentId || body.attachmentMetadata) {
    throw APIError.invalidArgument(
      "Attachment fields set without attachmentType"
    );
  }
};

/**
 * DB-touching validation. Runs inside the transaction.
 *
 * For lesson_reference attachments, confirms the lesson instance exists
 * in the same organization. (Authorization beyond that — "is the sender
 * actually allowed to invite to this lesson?" — is the API layer's job.)
 */
export const validateAttachment = async (input: {
  lessons: ReturnType<typeof createLessonInstanceRepo>;
  organizationId: string;
  body: SendMessageBody;
}): Promise<void> => {
  if (input.body.attachmentType !== MessageAttachmentType.LESSON_REFERENCE) {
    return;
  }
  if (!input.body.attachmentId) return; // already covered by validateMessageBody

  // findOneInstance throws APIError.notFound if missing or wrong org.
  await input.lessons.findOne(input.body.attachmentId, input.organizationId);
};

export const attachmentExpectsResponse = (
  type: MessageAttachmentType | null
): boolean => {
  return (
    type === MessageAttachmentType.LESSON_REFERENCE ||
    type === MessageAttachmentType.LESSON_PROPOSAL
  );
};

/**
 * Confirm the responder is allowed to act on behalf of the targeted rider.
 *
 * Allowed responders:
 *   - The rider themselves (if their member is the responder)
 *   - Any guardian of the rider (if responder is in their guardian relationships)
 *
 * Staff-side authz (e.g., "you can't accept your own invitation") is enforced
 * by the saga's direction check, not here.
 */
export const assertCanRespond = async (input: {
  forRiderId: string;
  responderMemberId: string;
  organizationId: string;
}): Promise<void> => {
  const rider = await memberRepo.findOneRider(
    input.forRiderId,
    input.organizationId
  );
  const guardianRelationships = await guardianRepo.findRelationshipsByDependent(
    rider.memberId,
    input.organizationId
  );

  // Rider's own member can respond
  if (rider.memberId === input.responderMemberId) return;

  // Any guardian can respond
  const isGuardian = guardianRelationships.some(
    (rel) => rel.guardianMemberId === input.responderMemberId
  );
  if (isGuardian) return;

  throw APIError.permissionDenied(
    "Not authorized to respond on behalf of this rider"
  );
};
