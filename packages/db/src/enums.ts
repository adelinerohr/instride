/**
 * Closed value sets shared by the database, the API and both frontends.
 *
 * This file has ZERO imports on purpose: web and native can import
 * "@instride/db/enums" without pulling drizzle-orm into their bundles.
 * Schema files pass these objects to pgEnum, Zod takes them as z.enum(X),
 * so the database type, the TypeScript union and the validator can't drift.
 */

export const MembershipRole = {
  ADMIN: "admin",
  TRAINER: "trainer",
  RIDER: "rider",
  GUARDIAN: "guardian",
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
