import {
  useCreateOrganization,
  useUpdateCurrentUser,
  useUpdateOrganization,
} from "@instride/api";
import serverClient from "@instride/server-client";
import { useStore } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { OrganizationDetailsStep } from "@/features/onboarding/components/steps/organization-details";
import { OrganizationSetupStep } from "@/features/onboarding/components/steps/organization-setup";
import { PersonalDetailsStep } from "@/features/onboarding/components/steps/personal-details";
import { OnboardingWizard } from "@/features/onboarding/components/wizard";
import {
  organizationOnboardingFormOpts,
  buildOrganizationOnboardingDefaultValues,
  organizationOnboardingSteps,
} from "@/features/onboarding/lib/organization/form";
import { OnboardingOrganizationStep } from "@/features/onboarding/lib/organization/validators";
import type { WizardStep } from "@/features/onboarding/lib/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute("/(authenticated)/create-organization")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const updateCurrentUser = useUpdateCurrentUser();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const form = useAppForm({
    ...organizationOnboardingFormOpts,
    defaultValues: buildOrganizationOnboardingDefaultValues(user),
    onSubmit: async ({ value, formApi }) => {
      switch (value.section) {
        case OnboardingOrganizationStep.PersonalDetails:
          console.log("PersonalDetails:", value.personalDetails);
          formApi.setFieldValue(
            "section",
            OnboardingOrganizationStep.OrganizationSetup
          );
          break;
        case OnboardingOrganizationStep.OrganizationSetup:
          console.log("OrganizationSetup:", value.organizationSetup);
          const slugCheck = await serverClient.organizations.checkSlug(
            value.organizationSetup.slug
          );
          if (!slugCheck.available) {
            form.setErrorMap({
              onSubmit: {
                fields: {
                  "organizationSetup.slug":
                    "This slug is already taken. Please try a different one.",
                },
              },
            });
            return;
          }
          formApi.setFieldValue(
            "section",
            OnboardingOrganizationStep.OrganizationDetails
          );
          break;
        case OnboardingOrganizationStep.OrganizationDetails:
          console.log("Complete:", value);
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

            // 2. Create organization
            const { logoFile, ...organizationDetails } =
              value.organizationDetails;

            let logoUrl = null;

            const organization = await createOrganization.mutateAsync({
              ...organizationDetails,
              ...value.organizationSetup,
            });

            if (logoFile) {
              const formData = new FormData();
              formData.append("file", logoFile);
              await fetch(
                `/upload/avatar/organization?organizationId=${organization.id}`,
                {
                  method: "POST",
                  body: formData,
                  credentials: "include",
                }
              );
            }

            // 3. Update organization
            await updateOrganization.mutateAsync({
              organizationId: organization.id,
              request: {
                logoUrl,
              },
            });

            // 4. Redirect to organization dashboard
            navigate({
              to: "/org/$slug/admin",
              params: {
                slug: value.organizationSetup.slug,
              },
            });
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."
            );
          }
          break;
      }
    },
  });

  const section = useStore(form.store, (state) => state.values.section);

  const currentStepIndex = organizationOnboardingSteps.findIndex(
    (s) => s.id === section
  )!;

  const goToStep = (step: WizardStep["id"]) =>
    form.setFieldValue("section", step as OnboardingOrganizationStep);

  return (
    <OnboardingWizard
      steps={organizationOnboardingSteps}
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
        {section === OnboardingOrganizationStep.PersonalDetails && (
          <PersonalDetailsStep form={form} fields="personalDetails" />
        )}
        {section === OnboardingOrganizationStep.OrganizationSetup && (
          <OrganizationSetupStep form={form} />
        )}
        {section === OnboardingOrganizationStep.OrganizationDetails && (
          <OrganizationDetailsStep form={form} />
        )}
        {error &&
          section === OnboardingOrganizationStep.OrganizationDetails && (
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
              goToStep(organizationOnboardingSteps[currentStepIndex - 1].id)
            }
          >
            Back
          </Button>
          <form.AppForm>
            <form.SubmitButton
              label={
                section === OnboardingOrganizationStep.OrganizationDetails
                  ? "Create Organization"
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
