import {
  useCompleteOnboarding,
  useJoinOrganization,
  useSignWaiver,
  useSubmitQuestionnaireResponse,
  useUpdateCurrentUser,
  waiverOptions,
} from "@instride/api";
import { MembershipRole, WaiverStatus } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useAppForm } from "@/shared/hooks/use-form";

export const Route = createFileRoute("/org/$slug/(authenticated)/onboarding")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.member.onboardingComplete) {
      throw Route.redirect({ to: "/org/$slug/portal" });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(waiverOptions.list());
  },
});

function RouteComponent() {
  const { user, organization } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const { data: waivers } = useSuspenseQuery(waiverOptions.list());
  const updateCurrentUser = useUpdateCurrentUser();
  const signWaiver = useSignWaiver();
  const submitQuestionnaireResponse = useSubmitQuestionnaireResponse();
  const joinOrganization = useJoinOrganization();
  const updateMember = useCompleteOnboarding();

  const activeWaiver = waivers.find((w) => w.status === WaiverStatus.ACTIVE);

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

    await updateCurrentUser.mutateAsync({
      name: value.personalDetails.name,
      phone: value.personalDetails.phone,
      image: value.personalDetails.removeImage ? null : imageUrl,
      dateOfBirth: value.personalDetails.dateOfBirth,
    });

    const member = await joinOrganization.mutateAsync({
      organizationId: organization.id,
      request: {
        roles,
      },
    });

    if (activeWaiver) {
      await signWaiver.mutateAsync({
        waiverId: activeWaiver.id,
        request: {},
      });
    }

    await submitQuestionnaireResponse.mutateAsync({
      questionnaireId: value.questionnaire.questionnaireId,
      request: {
        responses: value.questionnaire.responses,
      },
    });

    await updateMember.mutateAsync({
      memberId: member.id,
    });

    navigate({
      to: "/org/$slug/portal",
      params: { slug: organization.slug },
    });
  };

  const form = useAppForm({
    ...memberOnboardingFormOpts,
    defaultValues: buildMemberOnboardingDefaultValues(user),
    onSubmit: async ({ value, formApi }) => {
      const { section, accountType } = value;

      const isGuardianOnly =
        accountType.isGuardian && accountType.isRider === false;

      // Validate current step
      try {
        if (section === MemberOnboardingStep.PersonalDetails) {
          await formApi.validateField("personalDetails", "submit");
          formApi.setFieldValue("section", MemberOnboardingStep.AccountType);
          return;
        }

        if (section === MemberOnboardingStep.AccountType) {
          if (accountType.isGuardian && accountType.isRider === null) {
            setError("Please select whether you'll also be riding");
            return;
          }

          await formApi.validateField("accountType", "submit");
          formApi.setFieldValue(
            "section",
            MemberOnboardingStep.PersonalDetails
          );
          return;
        }

        if (section === MemberOnboardingStep.Questionnaire) {
          await formApi.validateField("questionnaire", "submit");

          // If guardian-only, skip to completion
          if (isGuardianOnly) {
            await completeOnboarding(value);
          } else {
            formApi.setFieldValue("section", MemberOnboardingStep.Waiver);
          }
          return;
        }

        if (section === MemberOnboardingStep.Waiver) {
          await formApi.validateField("waiver", "submit");

          // All validation passed - submit the onboarding
          await completeOnboarding(value);
          return;
        }
      } catch (err) {
        // Validation failed - form will show errors
        if (section === MemberOnboardingStep.Waiver) {
          console.error(err);
          setError("Failed to complete onboarding. Please try again.");
        }
      }
    },
  });

  const section = useStore(form.store, (state) => state.values.section);
  const accountType = useStore(form.store, (state) => state.values.accountType);

  const isGuardianOnly =
    accountType.isGuardian && accountType.isRider === false;

  // Filter steps based on account type
  const visibleSteps = React.useMemo(() => {
    if (isGuardianOnly) {
      return memberOnboardingSteps.filter(
        (step) =>
          step.id === MemberOnboardingStep.AccountType ||
          step.id === MemberOnboardingStep.PersonalDetails
      );
    }
    return memberOnboardingSteps;
  }, [isGuardianOnly]);

  const currentStepIndex = visibleSteps.findIndex((s) => s.id === section);

  const goToStep = (stepId: MemberOnboardingStep) => {
    const targetIndex = visibleSteps.findIndex((s) => s.id === stepId);
    if (targetIndex < currentStepIndex) {
      form.setFieldValue("section", stepId);
    }
  };

  const canGoBack = currentStepIndex > 0;
  const isLastStep =
    section === MemberOnboardingStep.Waiver ||
    (isGuardianOnly && section === MemberOnboardingStep.AccountType);

  const name = useStore(
    form.store,
    (state) => state.values.personalDetails.name
  );

  return (
    <OnboardingWizard
      steps={memberOnboardingSteps}
      currentStepIndex={currentStepIndex}
      onGoToStep={goToStep}
      title="Set up your membership"
      description="Complete the following steps to get started"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        {section === MemberOnboardingStep.PersonalDetails && (
          <PersonalDetailsStep form={form} fields="personalDetails" />
        )}

        {section === MemberOnboardingStep.Questionnaire && (
          <QuestionnaireStep
            form={form}
            fields="questionnaire"
            isDependent={false}
          />
        )}

        {section === MemberOnboardingStep.Waiver && (
          <WaiverStep
            form={form}
            fields="waiver"
            waiverContent={activeWaiver?.content ?? ""}
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
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                goToStep(memberOnboardingSteps[currentStepIndex - 1].id)
              }
            >
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
