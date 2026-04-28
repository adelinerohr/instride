import type {
  Conversation,
  ConversationSummary,
  MemberSummary,
  RiderSummary,
} from "@instride/api";
import { ConversationParticipantRole } from "@instride/shared/models/enums";

/**
 * Derive "primary" and optional "dependent" parties for the header.
 *
 * For staff viewers: primary is the rider/guardian on the other side.
 *   - If the subject rider is a placeholder (toddler), primary is the
 *     guardian and dependent is the placeholder rider.
 *   - Otherwise, primary is the rider themselves; if there's a guardian
 *     in participants AND the rider is restricted, show the rider as the
 *     dependent (visually emphasizing "this conversation is about a minor").
 *
 * For rider/guardian viewers: primary is the staff participant.
 *   (No dependent shown; staff is just one person.)
 *
 * For v1 the assumption is one subject rider per conversation. Group chats
 * (v2) will need this updated.
 */
export function useParties(
  conversation: Conversation | ConversationSummary,
  viewerMemberId: string
): {
  primary: MemberSummary;
  dependent: RiderSummary | null;
  recipient: MemberSummary;
} {
  const viewer = conversation.activeParticipants.find(
    (p) => p.memberId === viewerMemberId
  );
  const isViewerStaff = viewer?.role === ConversationParticipantRole.STAFF;

  if (isViewerStaff) {
    const subjectRider = conversation.subjectRiders[0];
    // Find a guardian in participants if any
    const guardianParticipant = conversation.activeParticipants.find(
      (p) => p.role === ConversationParticipantRole.GUARDIAN
    );

    // Placeholder rider → primary is the guardian, dependent is the rider
    const isPlaceholderRider = subjectRider.member.isPlaceholder;

    if (subjectRider && isPlaceholderRider && guardianParticipant) {
      return {
        primary: guardianParticipant.member,
        dependent: subjectRider,
        recipient: guardianParticipant.member,
      };
    }

    // Restricted rider with own account → show rider as dependent visually
    // (and use guardian as primary if present, else the rider's own member)
    if (subjectRider && subjectRider.isRestricted && guardianParticipant) {
      return {
        primary: guardianParticipant.member,
        dependent: subjectRider,
        recipient: subjectRider.member,
      };
    }

    // Adult rider → primary is the rider, no dependent
    const riderParticipant = conversation.activeParticipants.find(
      (p) => p.role === ConversationParticipantRole.RIDER
    );

    if (riderParticipant) {
      return {
        primary: riderParticipant.member,
        dependent: null,
        recipient: riderParticipant.member,
      };
    }

    // Fallback: shouldn't happen, but degrade gracefully
    if (guardianParticipant) {
      return {
        primary: guardianParticipant.member,
        dependent: null,
        recipient: guardianParticipant.member,
      };
    }
  }

  // Viewer is rider or guardian → primary is the staff person
  const staffParticipant = conversation.activeParticipants.find(
    (p) => p.role === ConversationParticipantRole.STAFF
  );
  if (staffParticipant) {
    return {
      primary: staffParticipant.member,
      dependent: null,
      recipient: staffParticipant.member,
    };
  }

  // Fallback: degenerate conversation, just show the first non-viewer
  const other = conversation.activeParticipants.find(
    (p) => p.memberId !== viewerMemberId
  );

  return {
    primary: other?.member ?? viewer!.member,
    dependent: null,
    recipient: other?.member ?? viewer!.member,
  };
}
