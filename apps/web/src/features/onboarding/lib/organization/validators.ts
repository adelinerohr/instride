import {
  createOrganizationInputSchema,
  updateOrganizationInputSchema,
  updateUserInputSchema,
} from "@instride/shared";
import { z } from "zod";

export enum OnboardingOrganizationStep {
  PersonalDetails = "personal-details",
  OrganizationSetup = "organization-setup",
  OrganizationDetails = "organization-details",
}

export const personalDetailsSchema = z.object({
  personalDetails: z.object({
    ...updateUserInputSchema.shape,
    imageFile: z.file().nullable(),
    removeImage: z.boolean(),
  }),
});

export const organizationSetupSchema = z.object({
  organizationSetup: createOrganizationInputSchema,
});

export const organizationDetailsSchema = z.object({
  organizationDetails: z.object({
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
  }),
});

export const organizationOnboardingSchema = z.object({
  section: z.enum(OnboardingOrganizationStep),
  ...personalDetailsSchema.shape,
  ...organizationSetupSchema.shape,
  ...organizationDetailsSchema.shape,
});

export type OrganizationOnboardingFormValues = z.infer<
  typeof organizationOnboardingSchema
>;
