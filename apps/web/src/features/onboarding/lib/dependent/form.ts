import type { GuardianPermissions } from "@instride/api";
import { signWaiverSchema, updateUserSchema } from "@instride/shared";
import { formOptions } from "@tanstack/react-form";
import z from "zod";

import { questionnaireResponseSchema } from "../member/questionnaire.schema";

export enum DependentOnboardingStep {
  PersonalDetails = "personal-details",
  Permissions = "permissions",
  Questionnaire = "questionnaire",
  Waiver = "waiver",
}

const dependentPersonalSchema = updateUserSchema
  .omit({
    email: true,
  })
  .extend({
    imageFile: z.file().nullable(),
    removeImage: z.boolean(),
  });

export const dependentOnboardingSchema = z.object({
  section: z.enum(DependentOnboardingStep),
  personalDetails: dependentPersonalSchema,
  questionnaire: questionnaireResponseSchema,
  waiver: signWaiverSchema,
});

export type DependentOnboardingFormValues = z.infer<
  typeof dependentOnboardingSchema
> & {
  permissions: GuardianPermissions;
};

export const defaultDependentOnboardingValues: DependentOnboardingFormValues = {
  section: DependentOnboardingStep.PersonalDetails,
  personalDetails: {
    name: "",
    phone: null,
    dateOfBirth: "",
    image: null,
    imageFile: null,
    removeImage: false,
  },
  permissions: {
    bookings: {
      canBookLessons: false,
      canJoinEvents: false,
      requiresApproval: false,
      canCancel: false,
    },
    communication: {
      canPost: false,
      canComment: false,
      receiveEmailNotifications: false,
      receiveTextNotifications: false,
    },
    profile: {
      canEdit: false,
    },
  },
  questionnaire: {
    questionnaireId: "",
    responses: [],
  },
  waiver: {
    signedBy: "",
    termsAgreed: false,
    signatureAcknowledgement: false,
  },
};

export const dependentOnboardingFormOpts = formOptions({
  defaultValues: defaultDependentOnboardingValues,
});
