import { formOptions } from "@tanstack/react-form";

import type { AuthUser } from "@/shared/lib/auth/client";

import {
  OnboardingOrganizationStep,
  type OrganizationOnboardingFormValues,
} from "./validators";

export const organizationOnboardingSteps = [
  {
    id: OnboardingOrganizationStep.PersonalDetails,
    label: "Personal Details",
    description: "Tell us about yourself",
  },
  {
    id: OnboardingOrganizationStep.OrganizationSetup,
    label: "Organization Setup",
    description: "Set up your basic information for your organization",
  },
  {
    id: OnboardingOrganizationStep.OrganizationDetails,
    label: "Organization Details",
    description: "Add your organization's details",
  },
];

const defaultValues: OrganizationOnboardingFormValues = {
  section: OnboardingOrganizationStep.PersonalDetails,
  personalDetails: {
    name: "",
    email: "",
    dateOfBirth: "",
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
      dateOfBirth: "",
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
});
