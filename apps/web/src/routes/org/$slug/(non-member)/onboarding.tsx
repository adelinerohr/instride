import {
  questionnaireOptions,
  useOnboardMember,
  waiverOptions,
} from "@instride/api";
import { MembershipRole, WaiverStatus } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";

import { AccountTypeStep } from "@/features/onboarding/components/steps/account-type";
import { PersonalDetailsStep } from "@/features/onboarding/components/steps/personal-details";
import { QuestionnaireStep } from "@/features/onboarding/components/steps/questionnaire";
import { WaiverStep } from "@/features/onboarding/components/steps/waiver";
import { OnboardingWizard } from "@/features/onboarding/components/wizard";
import {
  buildMemberOnboardingDefaultValues,
  MemberOnboardingStep,
  memberOnboardingFormOpts,
  memberOnboardingSteps,
  type MemberOnboardingFormValues,
} from "@/features/onboarding/lib/member/form";
import type { WizardStep } from "@/features/onboarding/lib/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useAppForm } from "@/shared/hooks/use-form";

export const Route = createFileRoute("/org/$slug/(non-member)/onboarding")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.pendingGuardianInvitation) {
      throw Route.redirect({
        to: "/org/$slug/invitation/$token",
        params: {
          slug: context.organization.slug,
          token: context.pendingGuardianInvitation.token,
        },
        search: {
          type: "guardian",
        },
      });
    }
    if (context.pendingOrganizationInvitation) {
      throw Route.redirect({
        to: "/org/$slug/invitation/$token",
        params: {
          slug: context.organization.slug,
          token: context.pendingOrganizationInvitation.id,
        },
        search: { type: "organization" },
      });
    }
  },
  loader: async ({ context }) => {
    console.log("context.organization.id", context.organization.id);
    await context.queryClient.ensureQueryData(
      waiverOptions.list(context.organization.id)
    );
    await context.queryClient.ensureQueryData(
      questionnaireOptions.list(context.organization.id)
    );
  },
});

function RouteComponent() {
  const { user, organization } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const { data: waivers } = useSuspenseQuery(
    waiverOptions.list(organization.id)
  );
  const { data: questionnaires } = useSuspenseQuery(
    questionnaireOptions.list(organization.id)
  );

  const onboardMember = useOnboardMember();

  const activeWaiver = waivers.find((w) => w.status === WaiverStatus.ACTIVE);
  const activeQuestionnaire = questionnaires.find((q) => q.isActive);

  const completeOnboarding = async (value: MemberOnboardingFormValues) => {
    setError(null);

    const roles: MembershipRole[] = [];

    if (value.accountType.isGuardian) {
      roles.push(MembershipRole.GUARDIAN);
    }

    if (value.accountType.isRider) {
      roles.push(MembershipRole.RIDER);
    }

    let imageUrl = value.personalDetails.image;

    if (value.personalDetails.imageFile) {
      const formData = new FormData();
      formData.append("file", value.personalDetails.imageFile);
      const response = await fetch("/upload/avatar/user", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const { url } = await response.json();
      imageUrl = url;
    }

    await onboardMember.mutateAsync(
      {
        organizationId: organization.id,
        user: {
          name: value.personalDetails.name,
          phone: value.personalDetails.phone,
          image: value.personalDetails.removeImage ? null : imageUrl,
          dateOfBirth: value.personalDetails.dateOfBirth,
          roles,
        },
        ...(activeQuestionnaire
          ? {
              questionnaire: {
                questionnaireId: activeQuestionnaire.id,
                responses: value.questionnaire.responses,
              },
            }
          : {}),
        ...(activeWaiver
          ? {
              waiver: {
                waiverId: activeWaiver.id,
              },
            }
          : {}),
      },
      {
        onSuccess: async () => {
          await router.invalidate();
          navigate({
            to: "/org/$slug/portal",
            params: { slug: organization.slug },
          });
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  };

  const form = useAppForm({
    ...memberOnboardingFormOpts,
    defaultValues: buildMemberOnboardingDefaultValues(user),
    onSubmit: async ({ value, formApi }) => {
      const { section } = value;

      // Advance to the next visible step, or complete if we're at the end.
      const advance = async () => {
        const currentIndex = visibleSteps.findIndex((s) => s.id === section);
        const nextStep = visibleSteps[currentIndex + 1];
        if (nextStep) {
          formApi.setFieldValue("section", nextStep.id);
        } else {
          await completeOnboarding(value);
        }
      };

      try {
        if (section === MemberOnboardingStep.PersonalDetails) {
          await formApi.validateField("personalDetails", "submit");
          await advance();
          return;
        }

        if (section === MemberOnboardingStep.AccountType) {
          if (
            value.accountType.isGuardian &&
            value.accountType.isRider === null
          ) {
            setError("Please select whether you'll also be riding");
            return;
          }
          await formApi.validateField("accountType", "submit");
          await advance();
          return;
        }

        if (section === MemberOnboardingStep.Questionnaire) {
          await formApi.validateField("questionnaire", "submit");
          await advance();
          return;
        }

        if (section === MemberOnboardingStep.Waiver) {
          await formApi.validateField("waiver", "submit");
          await advance();
          return;
        }
      } catch (err) {
        console.error(err);
        const isAtLastStep =
          visibleSteps[visibleSteps.length - 1]?.id === section;
        if (isAtLastStep) {
          setError("Failed to complete onboarding. Please try again.");
        }
      }
    },
  });

  const section = useStore(form.store, (state) => state.values.section);
  const name = useStore(
    form.store,
    (state) => state.values.personalDetails.name
  );

  // The set of steps the current user will see. Order comes from
  // memberOnboardingSteps; presence is gated by org config.
  const visibleSteps = React.useMemo(() => {
    const includedIds = new Set<MemberOnboardingStep>([
      MemberOnboardingStep.PersonalDetails,
      MemberOnboardingStep.AccountType,
    ]);

    if (activeQuestionnaire) {
      includedIds.add(MemberOnboardingStep.Questionnaire);
    }
    if (activeWaiver) {
      includedIds.add(MemberOnboardingStep.Waiver);
    }

    return memberOnboardingSteps.filter((step) => includedIds.has(step.id));
  }, [activeWaiver, activeQuestionnaire]);

  const currentStepIndex = visibleSteps.findIndex((s) => s.id === section);
  const canGoBack = currentStepIndex > 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  const goToStep = (stepId: WizardStep["id"]) => {
    const targetIndex = visibleSteps.findIndex((s) => s.id === stepId);
    if (targetIndex === -1 || targetIndex >= currentStepIndex) {
      return;
    }
    form.setFieldValue("section", stepId as MemberOnboardingStep);
  };

  const goBack = () => {
    const previousStep = visibleSteps[currentStepIndex - 1];
    if (previousStep) {
      goToStep(previousStep.id);
    }
  };

  return (
    <OnboardingWizard
      steps={visibleSteps}
      currentStepIndex={currentStepIndex}
      onGoToStep={goToStep}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        {section === MemberOnboardingStep.PersonalDetails && (
          <PersonalDetailsStep
            form={form}
            fields="personalDetails"
            isDependent={false}
          />
        )}

        {section === MemberOnboardingStep.AccountType && (
          <AccountTypeStep form={form} fields="accountType" />
        )}

        {section === MemberOnboardingStep.Questionnaire &&
          activeQuestionnaire && (
            <QuestionnaireStep
              form={form}
              fields="questionnaire"
              isDependent={false}
              questionnaire={activeQuestionnaire}
            />
          )}

        {section === MemberOnboardingStep.Waiver && activeWaiver && (
          <WaiverStep
            form={form}
            fields="waiver"
            waiverContent={activeWaiver.content}
            name={name}
          />
        )}

        {error && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive"
          >
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          {canGoBack && (
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
          )}

          <form.AppForm>
            <form.SubmitButton
              label={isLastStep ? "Complete Onboarding" : "Next"}
              loadingLabel={isLastStep ? "Submitting..." : "Validating..."}
            />
          </form.AppForm>
        </div>
      </form>
    </OnboardingWizard>
  );
}
