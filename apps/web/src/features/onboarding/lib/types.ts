import type { DependentOnboardingStep } from "./dependent/form";
import type { MemberOnboardingStep } from "./member/form";
import type { OnboardingOrganizationStep } from "./organization/validators";

export type WizardStep = {
  id:
    | MemberOnboardingStep
    | OnboardingOrganizationStep
    | DependentOnboardingStep;
  label: string;
  description: string;
};
