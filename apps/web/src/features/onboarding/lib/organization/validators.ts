import {
  createOrganizationInputSchema,
  updateOrganizationInputSchema,
} from "@instride/shared";
import { z } from "zod";

import { personalDetailsSchema } from "../validators";

export enum OnboardingOrganizationStep {
  PersonalDetails = "personal-details",
  OrganizationSetup = "organization-setup",
  OrganizationDetails = "organization-details",
}

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
