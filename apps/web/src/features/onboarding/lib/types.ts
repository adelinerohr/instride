import type { OnboardingOrganizationStep } from "./organization/validators";

export type WizardStep = {
  id: OnboardingOrganizationStep;
  label: string;
};
