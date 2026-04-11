import type { MemberOnboardingStep } from "./member/validators";
import type { OnboardingOrganizationStep } from "./organization/validators";

export type WizardStep = {
  id: MemberOnboardingStep | OnboardingOrganizationStep;
  label: string;
};
