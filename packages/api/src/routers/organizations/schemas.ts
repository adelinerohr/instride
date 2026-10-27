import {
  OrganizationInsertSchema,
  OrganizationUpdateSchema,
} from "@instride/db/schemas";
import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateOrganizationSchema = OrganizationInsertSchema.pick({
  name: true,
  slug: true,
  timezone: true,
}).extend({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(SLUG_PATTERN, "Lowercase letters, numbers and dashes only"),
  timezone: z.string().min(1),
});
export type CreateOrganizationValues = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = OrganizationUpdateSchema.pick({
  name: true,
  timezone: true,
  logoUrl: true,
  primaryColor: true,
  phone: true,
  website: true,
  facebook: true,
  instagram: true,
  youtube: true,
  tiktok: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  postalCode: true,
  allowSameDayBookings: true,
  allowPublicJoin: true,
});
export type UpdateOrganizationValues = z.infer<typeof UpdateOrganizationSchema>;

export const OrganizationBySlugSchema = z.object({ slug: z.string() });
