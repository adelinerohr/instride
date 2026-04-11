import { formOptions } from "@tanstack/react-form";

import { personalDetailsSchema } from "../validators";
import {
  memberOnboardingSchema,
  MemberOnboardingStep,
  questionnaireStepSchema,
  waiverStepSchema,
  type MemberOnboardingFormValues,
} from "./validators";

export const memberOnboardingSteps = [
  {
    id: MemberOnboardingStep.PersonalDetails,
    label: "Personal Details",
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

export const defaultMemberOnboardingValues: MemberOnboardingFormValues = {
  section: MemberOnboardingStep.PersonalDetails,
  personalDetails: {
    name: "",
    email: "",
    phone: null,
    image: null,
    imageFile: null,
    removeImage: false,
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
  validators: {
    onSubmit: ({ value, formApi }) => {
      if (value.section === MemberOnboardingStep.PersonalDetails) {
        return formApi.parseValuesWithSchema(
          personalDetailsSchema as typeof memberOnboardingSchema
        );
      }
      if (value.section === MemberOnboardingStep.Questionnaire) {
        return formApi.parseValuesWithSchema(
          questionnaireStepSchema as typeof memberOnboardingSchema
        );
      }
      if (value.section === MemberOnboardingStep.Waiver) {
        return formApi.parseValuesWithSchema(
          waiverStepSchema as typeof memberOnboardingSchema
        );
      }
    },
  },
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
      phone: user.phone ?? null,
      image: user.image ?? null,
      imageFile: null,
      removeImage: false,
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
