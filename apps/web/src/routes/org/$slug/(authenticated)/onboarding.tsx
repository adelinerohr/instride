import { useUpdateCurrentUser, waiverOptions } from "@instride/api";
import { WaiverStatus } from "@instride/shared";
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
  memberOnboardingFormOpts,
  memberOnboardingSteps,
} from "@/features/onboarding/lib/member/form";
import { MemberOnboardingStep } from "@/features/onboarding/lib/member/validators";
import type { WizardStep } from "@/features/onboarding/lib/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute("/org/$slug/(authenticated)/onboarding")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(waiverOptions.list());
  },
});

function RouteComponent() {
  const { user, organization } = Route.useRouteContext();
  const updateCurrentUser = useUpdateCurrentUser();
  const navigate = Route.useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const { data: waivers } = useSuspenseQuery(waiverOptions.list());

  const waiverContent =
    waivers.find((w) => w.status === WaiverStatus.ACTIVE)?.content ?? "";

  const form = useAppForm({
    ...memberOnboardingFormOpts,
    defaultValues: buildMemberOnboardingDefaultValues(user),
    onSubmit: async ({ value, formApi }) => {
      switch (value.section) {
        case MemberOnboardingStep.PersonalDetails:
          console.log("PersonalDetails:", value.personalDetails);
          formApi.setFieldValue("section", MemberOnboardingStep.Questionnaire);
          break;
        case MemberOnboardingStep.Questionnaire:
          console.log("Questionnaire:", value.questionnaire);
          formApi.setFieldValue("section", MemberOnboardingStep.Waiver);
          break;
        case MemberOnboardingStep.Waiver:
          console.log("Waiver:", value.waiver);
          try {
            // 1. Update user
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
            });

            navigate({
              to: "/org/$slug/portal",
              params: {
                slug: organization.slug,
              },
            });
          } catch (error) {
            console.error(error);
            setError("Failed to create member.");
          }
          break;
      }
    },
  });

  const section = useStore(form.store, (state) => state.values.section);

  const currentStepIndex = memberOnboardingSteps.findIndex(
    (s) => s.id === section
  )!;

  const goToStep = (step: WizardStep["id"]) => {
    form.setFieldValue("section", step as MemberOnboardingStep);
  };

  return (
    <OnboardingWizard
      steps={memberOnboardingSteps}
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
            waiverContent={waiverContent}
          />
        )}
        {error && section === MemberOnboardingStep.Waiver && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive"
          >
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={currentStepIndex === 0}
            onClick={() =>
              goToStep(memberOnboardingSteps[currentStepIndex - 1].id)
            }
          >
            Back
          </Button>
          <form.AppForm>
            <form.SubmitButton
              label={
                section === MemberOnboardingStep.Waiver
                  ? "Complete Onboarding"
                  : "Next"
              }
              loadingLabel="Loading..."
            />
          </form.AppForm>
        </div>
      </form>
    </OnboardingWizard>
  );
}
