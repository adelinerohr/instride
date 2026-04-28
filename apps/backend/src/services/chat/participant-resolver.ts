import { ConversationParticipantRole } from "@instride/shared";
import { APIError } from "encore.dev/api";

// Pure function: given a rider and a set of staff members, returns the
// participant rows that should be inserted for a new conversation.
//
// This is the single source of truth for the dependent/guardian
// participation rules. Every code path that creates a conversation OR adds
// a subject rider to an existing conversation flows through this function.
//
// The rider domain has two independent flags that affect participation:
//   - rider.isRestricted: "is a dependent" — a guardian relationship exists.
//     A teenager with their own account managed by their parents is restricted.
//   - member.isPlaceholder: "no login attached" — dummy account for someone
//     who can't (or doesn't yet) log in themselves. A toddler rider tracked
//     for booking purposes is a placeholder.
//
// These are orthogonal:
//   restricted=F, placeholder=F → adult with own account (participant)
//   restricted=T, placeholder=F → teen dependent with own account (participant)
//   restricted=T, placeholder=T → toddler tracked by parents (NOT a participant)
//   restricted=F, placeholder=T → data corruption (rejected)
//
// Rules:
// - Staff members are always included as 'staff' participants.
// - The rider is included as 'rider' iff their member is NOT a placeholder.
//   Placeholder accounts have no login, so adding them does nothing useful.
// - All guardian relationships produce 'guardian' participants regardless
//   of the dependent's placeholder status — guardians are how the rider
//   side reads chats about a placeholder dependent.
// - Validation: if the rider is restricted OR a placeholder, there must be
//   at least one guardian (otherwise no one on the rider side can read).
// - Deduplication: if the same memberId would be added with multiple
//   roles, staff role wins, then guardian, then rider.
//
// This module is pure and synchronous. The caller is responsible for
// fetching the rider, its member'

export type ResolverRider = {
  id: string;
  memberId: string;
  isRestricted: boolean;
  isPlaceholder: boolean;
};

export type ResolverGuardianRelationship = {
  guardianMemberId: string;
};

export type ResolveParticipantsInput = {
  rider: ResolverRider;
  guardianRelationships: ResolverGuardianRelationship[];
  staffMemberIds: string[];
};

export type ResolvedParticipant = {
  memberId: string;
  role: ConversationParticipantRole;
};

const rolePriority: Record<ConversationParticipantRole, number> = {
  [ConversationParticipantRole.STAFF]: 3,
  [ConversationParticipantRole.GUARDIAN]: 2,
  [ConversationParticipantRole.RIDER]: 1,
};

export function resolveParticipantsForRider(
  input: ResolveParticipantsInput
): ResolvedParticipant[] {
  if (input.staffMemberIds.length === 0) {
    throw APIError.invalidArgument(
      "A conversation must have at least one staff member"
    );
  }

  // Data integrity: a placeholder member should always be a dependent.
  // The opposite (restricted but not placeholder) is fine — a teen with
  // their own account can be restricted.
  if (input.rider.isPlaceholder && !input.rider.isRestricted) {
    throw APIError.failedPrecondition(
      "Placeholder rider must be restricted (data integrity)"
    );
  }

  // The rider side needs *someone* who can actually read the chat. If the
  // rider can't (placeholder) OR is dependent (restricted), there must be
  // at least one guardian.
  const riderCanRead = !input.rider.isPlaceholder;
  if (
    (input.rider.isPlaceholder || input.rider.isRestricted) &&
    input.guardianRelationships.length === 0
  ) {
    throw APIError.failedPrecondition(
      riderCanRead
        ? "Restricted rider has no guardians; cannot create conversation"
        : "Placeholder rider has no guardians; no one on rider side can read"
    );
  }

  // Dedupe by memberId; higher-priority role wins on conflict
  const participants = new Map<string, ConversationParticipantRole>();

  const addOrUpgrade = (
    memberId: string,
    role: ConversationParticipantRole
  ) => {
    const existing = participants.get(memberId);
    if (!existing || rolePriority[role] > rolePriority[existing]) {
      participants.set(memberId, role);
    }
  };

  // Staff first.
  for (const staffMemberId of input.staffMemberIds) {
    addOrUpgrade(staffMemberId, ConversationParticipantRole.STAFF);
  }

  // Rider side: restricted riders are excluded, only their guardians are added
  if (!input.rider.isPlaceholder) {
    addOrUpgrade(input.rider.memberId, ConversationParticipantRole.RIDER);
  }

  for (const guardianRelationship of input.guardianRelationships) {
    addOrUpgrade(
      guardianRelationship.guardianMemberId,
      ConversationParticipantRole.GUARDIAN
    );
  }

  return Array.from(participants.entries()).map(([memberId, role]) => ({
    memberId,
    role,
  }));
}

// ----------------------------------------------------------------------------
// Multi-rider variant — ready for group chats (v2)
// ----------------------------------------------------------------------------
//
// For v1, callers pass a single-element array. The resolver dedupes the
// participant set across riders so siblings sharing a guardian don't
// create duplicate guardian rows.

export type ResolveParticipantsForRidersInput = {
  riders: Array<{
    rider: ResolverRider;
    guardianRelationships: ResolverGuardianRelationship[];
  }>;
  staffMemberIds: string[];
};

export function resolveParticipantsForRiders(
  input: ResolveParticipantsForRidersInput
): ResolvedParticipant[] {
  if (input.riders.length === 0) {
    throw APIError.invalidArgument("At least one rider is required");
  }

  const merged = new Map<string, ConversationParticipantRole>();

  for (const { rider, guardianRelationships } of input.riders) {
    const resolved = resolveParticipantsForRider({
      rider,
      guardianRelationships,
      staffMemberIds: input.staffMemberIds,
    });

    for (const { memberId, role } of resolved) {
      const existing = merged.get(memberId);
      if (!existing || rolePriority[role] > rolePriority[existing]) {
        merged.set(memberId, role);
      }
    }
  }

  return Array.from(merged.entries()).map(([memberId, role]) => ({
    memberId,
    role,
  }));
}
