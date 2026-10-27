/**
 * What a guardian allows a dependent to do on their own.
 *
 * Stored as jsonb on guardian_relationships. ALWAYS read it through
 * `parseGuardianPermissions` so rows written before a key existed get that
 * key's default instead of `undefined`. Safe for web/native (zod only).
 */
import { z } from "zod";

import { DependentAction } from "./enums";

export const GuardianPermissionsSchema = z.object({
  bookings: z
    .object({
      canBookLessons: z.boolean().default(true),
      canJoinEvents: z.boolean().default(true),
      canCancel: z.boolean().default(true),
      /** Bookings and joins go to the guardian for approval first. */
      requiresApproval: z.boolean().default(true),
    })
    .prefault({}),
  communication: z
    .object({
      canPost: z.boolean().default(true),
      canComment: z.boolean().default(true),
    })
    .prefault({}),
  profile: z
    .object({
      canEdit: z.boolean().default(true),
    })
    .prefault({}),
});

export type GuardianPermissions = z.infer<typeof GuardianPermissionsSchema>;

/** Any subset of permissions, for "change just this toggle" updates. */
export const GuardianPermissionsPatchSchema = z.object({
  bookings: GuardianPermissionsSchema.shape.bookings
    .unwrap()
    .partial()
    .optional(),
  communication: GuardianPermissionsSchema.shape.communication
    .unwrap()
    .partial()
    .optional(),
  profile: GuardianPermissionsSchema.shape.profile
    .unwrap()
    .partial()
    .optional(),
});
export type GuardianPermissionsPatch = z.infer<
  typeof GuardianPermissionsPatchSchema
>;

export const defaultGuardianPermissions: GuardianPermissions =
  GuardianPermissionsSchema.parse({});

export function parseGuardianPermissions(raw: unknown): GuardianPermissions {
  return GuardianPermissionsSchema.parse(raw ?? {});
}

export function mergeGuardianPermissions(
  current: GuardianPermissions,
  patch: GuardianPermissionsPatch
): GuardianPermissions {
  return GuardianPermissionsSchema.parse({
    bookings: { ...current.bookings, ...patch.bookings },
    communication: { ...current.communication, ...patch.communication },
    profile: { ...current.profile, ...patch.profile },
  });
}

/**
 * Can a dependent do this on their own, and does it need approval first?
 * The single place these rules live; the API and the UI both call it.
 */
export function checkDependentAction(
  permissions: GuardianPermissions,
  action: DependentAction
): { allowed: boolean; requiresApproval: boolean } {
  const { bookings, communication, profile } = permissions;
  switch (action) {
    case DependentAction.BOOK_LESSON:
      return {
        allowed: bookings.canBookLessons,
        requiresApproval: bookings.requiresApproval,
      };
    case DependentAction.JOIN_EVENT:
      return {
        allowed: bookings.canJoinEvents,
        requiresApproval: bookings.requiresApproval,
      };
    case DependentAction.CANCEL_BOOKING:
      return { allowed: bookings.canCancel, requiresApproval: false };
    case DependentAction.POST:
      return { allowed: communication.canPost, requiresApproval: false };
    case DependentAction.COMMENT:
      return { allowed: communication.canComment, requiresApproval: false };
    case DependentAction.EDIT_PROFILE:
      return { allowed: profile.canEdit, requiresApproval: false };
    default: {
      const exhaustive: never = action;
      throw new Error(`Unknown dependent action: ${String(exhaustive)}`);
    }
  }
}
