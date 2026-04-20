import {
  createOrganizationInputSchema,
  updateOrganizationInputSchema,
  updateUserSchema,
} from "@instride/shared";
import { z } from "zod";

export enum OnboardingOrganizationStep {
  PersonalDetails = "personal-details",
  OrganizationSetup = "organization-setup",
  OrganizationDetails = "organization-details",
}

const personalDetailsSchema = updateUserSchema
  .omit({
    email: true,
  })
  .extend({
    imageFile: z.file().nullable(),
    removeImage: z.boolean(),
    email: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Enter a valid email address"
      ),
  });

export const organizationDetailsSchema = z.object({
  ...updateOrganizationInputSchema.omit({
    name: true,
    timezone: true,
    allowPublicJoin: true,
    primaryColor: true,
    logoUrl: true,
    allowSameDayBookings: true,
    authOrganizationId: true,
    slug: true,
  }).shape,
  logoFile: z.file().nullable(),
});

export const organizationOnboardingSchema = z.object({
  section: z.enum(OnboardingOrganizationStep),
  personalDetails: personalDetailsSchema,
  organizationSetup: createOrganizationInputSchema,
  organizationDetails: organizationDetailsSchema,
});

export type OrganizationOnboardingFormValues = z.infer<
  typeof organizationOnboardingSchema
>;
