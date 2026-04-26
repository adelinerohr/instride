import {
  MembershipRole,
  signWaiverSchema,
  updateUserSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";
import z from "zod";

import { questionnaireResponseSchema } from "./questionnaire.schema";

export enum MemberOnboardingStep {
  PersonalDetails = "personal-details",
  AccountType = "account-type",
  Questionnaire = "questionnaire",
  Waiver = "waiver",
}

export const memberOnboardingSteps = [
  {
    id: MemberOnboardingStep.PersonalDetails,
    label: "Personal Details",
    description: "Tell us about yourself",
  },
  {
    id: MemberOnboardingStep.AccountType,
    label: "Account Type",
    description: "How will you be using InStride?",
  },
  {
    id: MemberOnboardingStep.Questionnaire,
    label: "Questionnaire",
    description: "Answer a few questions to help us get to know you better",
  },
  {
    id: MemberOnboardingStep.Waiver,
    label: "Waiver",
    description: "Please review and sign to continue",
  },
];

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

export const memberOnboardingSchema = z.object({
  section: z.enum(MemberOnboardingStep),
  personalDetails: personalDetailsSchema,
  accountType: z.object({
    isGuardian: z.boolean(),
    isRider: z.boolean().nullable(),
  }),
  questionnaire: questionnaireResponseSchema,
  waiver: signWaiverSchema,
});

export type MemberOnboardingFormValues = z.infer<typeof memberOnboardingSchema>;

export const defaultMemberOnboardingValues: MemberOnboardingFormValues = {
  section: MemberOnboardingStep.PersonalDetails,
  personalDetails: {
    name: "",
    email: "",
    dateOfBirth: "",
    phone: null,
    image: null,
    imageFile: null,
    removeImage: false,
  },
  accountType: {
    isGuardian: false,
    isRider: null,
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

export const memberOnboardingFormOpts = formOptions({
  defaultValues: defaultMemberOnboardingValues,
});

export function buildMemberOnboardingDefaultValues(
  user: {
    name: string;
    email: string;
    image?: string | null;
    phone?: string | null;
  },
  invitedRoles: MembershipRole[] = []
): MemberOnboardingFormValues {
  const wasInvitedAsGuardian = invitedRoles.includes(MembershipRole.GUARDIAN);
  const wasInvitedAsRider = invitedRoles.includes(MembershipRole.RIDER);

  return {
    section: MemberOnboardingStep.PersonalDetails,
    personalDetails: {
      name: user.name,
      email: user.email,
      dateOfBirth: "",
      phone: user.phone ?? null,
      image: user.image ?? null,
      imageFile: null,
      removeImage: false,
    },
    accountType: {
      isGuardian: wasInvitedAsGuardian,
      // If already invited as rider, default true. If guardian, ask. Else null.
      isRider: wasInvitedAsRider ? true : wasInvitedAsGuardian ? null : false,
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
}
