import { formOptions } from "@tanstack/react-form";

import type { AuthUser } from "@/shared/lib/auth-client";

import {
  OnboardingOrganizationStep,
  organizationDetailsSchema,
  organizationOnboardingSchema,
  organizationSetupSchema,
  personalDetailsSchema,
  type OrganizationOnboardingFormValues,
} from "./validators";

export const organizationOnboardingSteps = [
  {
    id: OnboardingOrganizationStep.PersonalDetails,
    label: "Personal Details",
  },
  {
    id: OnboardingOrganizationStep.OrganizationSetup,
    label: "Organization Setup",
  },
  {
    id: OnboardingOrganizationStep.OrganizationDetails,
    label: "Organization Details",
  },
];

const defaultValues: OrganizationOnboardingFormValues = {
  section: OnboardingOrganizationStep.PersonalDetails,
  personalDetails: {
    name: "",
    email: "",
    phone: null,
    image: null,
    imageFile: null,
    removeImage: false,
  },
  organizationSetup: {
    name: "",
    slug: "",
    timezone: "",
    allowPublicJoin: false,
  },
  organizationDetails: {
    logoFile: null,
    website: null,
    phone: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    postalCode: null,
  },
};

export function buildOrganizationOnboardingDefaultValues(
  user: AuthUser
): OrganizationOnboardingFormValues {
  return {
    section: OnboardingOrganizationStep.PersonalDetails,
    personalDetails: {
      name: user.name,
      email: user.email,
      phone: null,
      image: user.image ?? null,
      imageFile: null,
      removeImage: false,
    },
    organizationSetup: {
      name: "",
      slug: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      allowPublicJoin: false,
    },
    organizationDetails: {
      logoFile: null,
      website: null,
      phone: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      state: null,
      postalCode: null,
    },
  };
}

export const organizationOnboardingFormOpts = formOptions({
  defaultValues,
  validators: {
    onSubmit: ({ value, formApi }) => {
      if (value.section === OnboardingOrganizationStep.PersonalDetails) {
        return formApi.parseValuesWithSchema(
          personalDetailsSchema as typeof organizationOnboardingSchema
        );
      }
      if (value.section === OnboardingOrganizationStep.OrganizationSetup) {
        return formApi.parseValuesWithSchema(
          organizationSetupSchema as typeof organizationOnboardingSchema
        );
      }
      if (value.section === OnboardingOrganizationStep.OrganizationDetails) {
        return formApi.parseValuesWithSchema(
          organizationDetailsSchema as typeof organizationOnboardingSchema
        );
      }
    },
  },
});
