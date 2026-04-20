import { z } from "zod";

export const dependentPermissionsSchema = z.object({
  bookings: z.object({
    canBookLessons: z.boolean(),
    canJoinEvents: z.boolean(),
    requiresApproval: z.boolean(),
    canCancel: z.boolean(),
  }),
  communication: z.object({
    canPost: z.boolean(),
    canComment: z.boolean(),
  }),
  visibility: z.object({
    canViewSchedule: z.boolean(),
    canViewProfile: z.boolean(),
  }),
  profile: z.object({
    canEdit: z.boolean(),
  }),
});
