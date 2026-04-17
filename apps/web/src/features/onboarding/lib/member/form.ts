import { signWaiverInputSchema, updateUserSchema } from "@instride/shared";
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
  },
  {
    id: MemberOnboardingStep.AccountType,
    label: "Account Type",
  },
  {
    id: MemberOnboardingStep.Questionnaire,
    label: "Questionnaire",
  },
  {
    id: MemberOnboardingStep.Waiver,
    label: "Waiver",
  },
];

const personalDetailsSchema = updateUserSchema.extend({
  imageFile: z.file().nullable(),
  removeImage: z.boolean(),
});

const signWaiverSchema = signWaiverInputSchema.extend({
  signedBy: z.string().min(1, "Signature is required"),
  termsAgreed: z.boolean().refine((value) => value, {
    message: "You must agree to the terms",
  }),
  signatureAcknowledgement: z.boolean().refine((value) => value, {
    message: "You must acknowledge your signature",
  }),
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
    signerMemberId: "",
    onBehalfOfMemberId: null,
    waiverId: "",
    signedBy: "",
    termsAgreed: false,
    signatureAcknowledgement: false,
  },
};

export const memberOnboardingFormOpts = formOptions({
  defaultValues: defaultMemberOnboardingValues,
});

export function buildMemberOnboardingDefaultValues(user: {
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
}): MemberOnboardingFormValues {
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
      isGuardian: false,
      isRider: null,
    },
    questionnaire: {
      questionnaireId: "",
      responses: [],
    },
    waiver: {
      signerMemberId: "",
      onBehalfOfMemberId: null,
      waiverId: "",
      signedBy: "",
      termsAgreed: false,
      signatureAcknowledgement: false,
    },
  };
}
