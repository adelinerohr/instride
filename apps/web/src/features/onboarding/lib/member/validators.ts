import { signWaiverInputSchema } from "@instride/shared";
import z from "zod";

import { personalDetailsSchema } from "../validators";
import { questionnaireSchema } from "./questionnaire.schema";

export enum MemberOnboardingStep {
  PersonalDetails = "personal-details",
  Questionnaire = "questionnaire",
  Waiver = "waiver",
}

export const questionnaireStepSchema = z.object({
  questionnaire: questionnaireSchema,
});

export const waiverStepSchema = z.object({
  waiver: signWaiverInputSchema.extend({
    signedBy: z.string(),
    termsAgreed: z.boolean(),
    signatureAcknowledgement: z.boolean(),
  }),
});

export const memberOnboardingSchema = z.object({
  section: z.enum(MemberOnboardingStep),
  ...personalDetailsSchema.shape,
  ...questionnaireStepSchema.shape,
  ...waiverStepSchema.shape,
});

export type MemberOnboardingFormValues = z.infer<typeof memberOnboardingSchema>;
