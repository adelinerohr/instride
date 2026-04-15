import { z } from "zod";

import { MembershipRole, MembershipCapability } from "../models/enums";

// --- Base Schema ------------------------------------------------------------

export const organizationSchema = z.object({
  id: z.uuid(),
  authOrganizationId: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(32, "Subdomain must be at most 32 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Only lowercase letters, numbers, and hyphens allowed"
    ),
  timezone: z.string().min(1, "Timezone is required"),
  logoUrl: z.string().nullable(),
  primaryColor: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  allowPublicJoin: z.boolean(),
  allowSameDayBookings: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const memberRoleSchema = z.enum([
  MembershipRole.ADMIN,
  MembershipRole.RIDER,
  MembershipRole.TRAINER,
  MembershipRole.GUARDIAN,
]);

export const memberCapabilitySchema = z.enum([
  MembershipCapability.RIDER,
  MembershipCapability.GUARDIAN,
  MembershipCapability.DEPENDENT,
]);

export const memberSchema = z.object({
  id: z.uuid(),
  roles: z.array(memberRoleSchema),
  capabilities: z.array(memberCapabilitySchema),
  userId: z.string(),
  authMemberId: z.string(),
  ridingLevel: z.string().optional(),
  onboardingComplete: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const trainerSchema = z.object({
  id: z.uuid(),
  organizationId: z.string(),
  memberId: z.string(),
  bio: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const riderSchema = z.object({
  id: z.uuid(),
  organizationId: z.string(),
  memberId: z.string(),
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  ridingLevelId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const levelSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// -- Contract Schemas ------------------------------------------------------------

export const genericGetOrganizationSchema = z.object({
  organization: organizationSchema,
});

export const createOrganizationInputSchema = organizationSchema.pick({
  name: true,
  slug: true,
  timezone: true,
  allowPublicJoin: true,
});

export const createOrganizationResponseSchema =
  genericGetOrganizationSchema.extend({
    membership: memberSchema,
  });

export const updateOrganizationInputSchema = organizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrganizationResponseSchema = genericGetOrganizationSchema;

export const checkSlugResponseSchema = z.object({
  available: z.boolean(),
});

export const joinOrganizationResponseSchema = z.object({
  membership: memberSchema,
});

export const getOrganizationResponseSchema = genericGetOrganizationSchema;

// ---- Members ------------------------------------------------------------

export const listMembersRequestSchema = z.object({
  organizationId: z.string(),
});

export const listMembersResponseSchema = z.object({
  members: z.array(memberSchema),
});

export const getMembershipResponseSchema = z.object({
  membership: memberSchema,
});

// ---- Levels ------------------------------------------------------------

export const createLevelInputSchema = levelSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
});

export const createLevelResponseSchema = z.object({
  level: levelSchema,
});

export const updateLevelRequestSchema = levelSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLevelResponseSchema = z.object({
  level: levelSchema,
});

export const listLevelsResponseSchema = z.object({
  levels: z.array(levelSchema),
});
