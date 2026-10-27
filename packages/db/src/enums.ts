/**
 * Closed value sets shared by the database, the API and both frontends.
 *
 * This file has ZERO imports on purpose: web and native can import
 * "@instride/db/enums" without pulling drizzle-orm into their bundles.
 * Schema files pass these objects to pgEnum, Zod takes them as z.enum(X),
 * so the database type, the TypeScript union and the validator can't drift.
 */

/**
 * What a member does at the barn. Being a guardian is NOT a role: it comes
 * from having an active row in guardian_relationships. A parent who doesn't
 * ride can be a member with no roles at all.
 */
export const MembershipRole = {
  ADMIN: "admin",
  TRAINER: "trainer",
  RIDER: "rider",
} as const;
export type MembershipRole =
  (typeof MembershipRole)[keyof typeof MembershipRole];

export const InvitationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REVOKED: "revoked",
} as const;
export type InvitationStatus =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];

/**
 * One invitations table, three things an invite link can do:
 * - member:            join the organization with `roles`
 * - guardian_link:     join (if needed) and become a guardian of `dependentMemberId`
 * - dependent_account: give the login-less dependent `dependentMemberId` their own login
 */
export const InvitationKind = {
  MEMBER: "member",
  GUARDIAN_LINK: "guardian_link",
  DEPENDENT_ACCOUNT: "dependent_account",
} as const;
export type InvitationKind =
  (typeof InvitationKind)[keyof typeof InvitationKind];

/** Things a dependent can do that a guardian's permissions control. */
export const DependentAction = {
  BOOK_LESSON: "book_lesson",
  JOIN_EVENT: "join_event",
  CANCEL_BOOKING: "cancel_booking",
  POST: "post",
  COMMENT: "comment",
  EDIT_PROFILE: "edit_profile",
} as const;
export type DependentAction =
  (typeof DependentAction)[keyof typeof DependentAction];

export const PendingActionStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;
export type PendingActionStatus =
  (typeof PendingActionStatus)[keyof typeof PendingActionStatus];
