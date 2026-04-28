import { lessonInstanceExpansion } from "../lessons/fragments";
import { riderExpansion, userExpansion } from "../organizations/fragments";

// Reuse cross-domain expansion fragments where possible. These imports
// match the shape used by feed/lessons services.

// Each participant carries its member (with authUser) for MemberSummary.
const participantWithMember = {
  with: userExpansion,
} as const;

// Each subject rider needs the rider expansion (member, authUser, etc.)
// to render RiderSummary.
const subjectRiderWithRider = {
  with: { rider: { with: riderExpansion } },
} as const;

// ---------------------------------------------------------------------------
// Message expansions
// ---------------------------------------------------------------------------

/**
 * The response row for a message, with the rider it's targeted at and
 * the responder if any.
 */
export const messageResponseExpansion = {
  forRider: { with: riderExpansion },
  responder: {
    with: {
      authUser: true,
    },
  },
} as const;

/**
 * Full message expansion — used everywhere a message is rendered into
 * a Message contract. Lazily-loaded relations (referencedLessonInstance,
 * response) are present even when null because Drizzle returns null for
 * one-relations that don't match.
 */
export const messageExpansion = {
  sender: {
    with: {
      authUser: true,
    },
  },
  referencedLessonInstance: { with: lessonInstanceExpansion },
  response: { with: messageResponseExpansion },
} as const;

// ---------------------------------------------------------------------------
// Conversation expansions
// ---------------------------------------------------------------------------

/**
 * Conversation summary — for the inbox list. Includes participants and
 * subject riders, but NOT the full message history. The "lastMessage" is
 * resolved separately by the service layer (denormalized from
 * lastMessageAt + a single targeted query) for performance.
 */
export const conversationSummaryExpansion = {
  subjectRiders: subjectRiderWithRider,
  activeParticipants: participantWithMember,
} as const;

/**
 * Full conversation — for the detail view. Same as summary; messages
 * are loaded via the paginated listMessages endpoint.
 */
export const conversationExpansion = {
  subjectRiders: subjectRiderWithRider,
  activeParticipants: participantWithMember,
} as const;
