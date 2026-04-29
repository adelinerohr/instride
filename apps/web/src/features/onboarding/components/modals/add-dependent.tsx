import {
  APIError,
  questionnaireOptions,
  useCreatePlaceholderRelationship,
  waiverOptions,
} from "@instride/api";
import type { Questionnaire } from "@instride/api";
import { WaiverStatus } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useAppForm } from "@/shared/hooks/use-form";

import {
  DependentOnboardingStep,
  dependentOnboardingFormOpts,
  type DependentOnboardingFormValues,
} from "../../lib/dependent/form";
import { GuardianControlsStep } from "../steps/guardian-controls";
import { PersonalDetailsStep } from "../steps/personal-details";
import { QuestionnaireStep } from "../steps/questionnaire";
import { WaiverStep } from "../steps/waiver";

export const addDependentModalHandler = DialogHandler.createHandle();

const dependentStepLabels: Record<DependentOnboardingStep, string> = {
  [DependentOnboardingStep.PersonalDetails]: "Personal details",
  [DependentOnboardingStep.Permissions]: "Permissions",
  [DependentOnboardingStep.Questionnaire]: "Questionnaire",
  [DependentOnboardingStep.Waiver]: "Waiver",
};

export function AddDependentModal() {
  const { user, organization } = useRouteContext({
    from: "/org/$slug/(authenticated)/settings/account/guardian",
  });

  const { data: waivers } = useSuspenseQuery(
    waiverOptions.list(organization.id)
  );
  const { data: questionnaires } = useSuspenseQuery(
    questionnaireOptions.list(organization.id)
  );

  const createPlaceholder = useCreatePlaceholderRelationship();

  const activeWaiver = waivers.find((w) => w.status === WaiverStatus.ACTIVE);
  const activeQuestionnaire =
    questionnaires.find((q) => q.isActive) ?? questionnaires[0];

  const completeDependentOnboarding = async (
    value: DependentOnboardingFormValues
  ) => {
    if (!organization) {
      toast.error("Organization not found");
      return;
    }

    await createPlaceholder.mutateAsync({
      placeholderProfile: {
        name: value.personalDetails.name,
        phone: value.personalDetails.phone,
        image: value.personalDetails.removeImage
          ? null
          : value.personalDetails.image,
        dateOfBirth: value.personalDetails.dateOfBirth,
      },
      permissions: value.permissions,
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
    });

    toast.success("Dependent onboarded successfully");
    addDependentModalHandler.close();
  };

  const form = useAppForm({
    ...dependentOnboardingFormOpts,
    onSubmit: async ({ value, formApi }) => {
      const { section } = value;

      try {
        if (section === DependentOnboardingStep.PersonalDetails) {
          await formApi.validateField("personalDetails", "submit");
          await formApi.validateField("permissions", "submit");
          formApi.setFieldValue("section", DependentOnboardingStep.Permissions);
          return;
        }

        if (section === DependentOnboardingStep.Permissions) {
          // No validation needed because they are boolean fields
          formApi.setFieldValue(
            "section",
            DependentOnboardingStep.Questionnaire
          );
          return;
        }

        if (section === DependentOnboardingStep.Questionnaire) {
          await formApi.validateField("questionnaire", "submit");

          if (activeWaiver) {
            formApi.setFieldValue("section", DependentOnboardingStep.Waiver);
          } else {
            await completeDependentOnboarding(value);
          }
          return;
        }

        if (section === DependentOnboardingStep.Waiver) {
          await formApi.validateField("waiver", "submit");
          await completeDependentOnboarding(value);
        }
      } catch (err) {
        const message =
          err instanceof APIError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Something went wrong";
        toast.error(message);
      }
    },
  });

  const section = useStore(form.store, (state) => state.values.section);

  const visibleSteps = useMemo(() => {
    const steps: DependentOnboardingStep[] = [
      DependentOnboardingStep.PersonalDetails,
      DependentOnboardingStep.Permissions,
    ];
    if (activeQuestionnaire) {
      steps.push(DependentOnboardingStep.Questionnaire);
    }
    if (activeWaiver) {
      steps.push(DependentOnboardingStep.Waiver);
    }
    return steps;
  }, [activeWaiver]);

  const currentStepIndex = visibleSteps.findIndex((s) => s === section);

  const goToStep = (stepId: DependentOnboardingStep) => {
    const targetIndex = visibleSteps.findIndex((s) => s === stepId);
    if (targetIndex < currentStepIndex) {
      form.setFieldValue("section", stepId);
    }
  };

  const canGoBack = currentStepIndex > 0;
  const isLastStep =
    section === DependentOnboardingStep.Waiver ||
    (!activeWaiver && section === DependentOnboardingStep.Questionnaire);

  const guardianName = user?.name ?? "";

  return (
    <Dialog handle={addDependentModalHandler}>
      <DialogPortal>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <DialogHeader>
              <DialogTitle>Add dependent</DialogTitle>
              <DialogDescription>
                Complete onboarding for a placeholder member account you manage
                as their guardian.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
              {visibleSteps.map((step, i) => (
                <span
                  key={step}
                  className={
                    step === section ? "font-medium text-foreground" : undefined
                  }
                >
                  {i + 1}. {dependentStepLabels[step]}
                </span>
              ))}
            </div>

            {section === DependentOnboardingStep.PersonalDetails && (
              <PersonalDetailsStep
                form={form}
                fields="personalDetails"
                isDependent
              />
            )}

            {section === DependentOnboardingStep.Questionnaire && (
              <QuestionnaireStep
                form={form}
                fields="questionnaire"
                isDependent
                questionnaire={activeQuestionnaire as Questionnaire}
              />
            )}

            {section === DependentOnboardingStep.Waiver && activeWaiver && (
              <>
                <p className="text-muted-foreground text-sm">
                  Sign as the guardian on behalf of your dependent. Use your
                  legal name to match your signature below.
                </p>
                <WaiverStep
                  form={form}
                  fields="waiver"
                  waiverContent={activeWaiver.content}
                  name={guardianName}
                />
              </>
            )}

            {section === DependentOnboardingStep.Permissions && (
              <GuardianControlsStep form={form} fields="permissions" />
            )}

            <DialogFooter>
              <div className="flex w-full justify-between gap-2">
                {canGoBack ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const prev = visibleSteps[currentStepIndex - 1];
                      if (prev) goToStep(prev);
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                <form.AppForm>
                  <form.SubmitButton
                    label={isLastStep ? "Complete" : "Next"}
                    loadingLabel={
                      isLastStep ? "Submitting..." : "Validating..."
                    }
                  />
                </form.AppForm>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
