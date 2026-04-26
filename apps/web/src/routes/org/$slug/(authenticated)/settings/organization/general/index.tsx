import { levelOptions, useUpdateOrganization } from "@instride/api";
import { createFileRoute } from "@tanstack/react-router";

import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";

import { OrganizationDetails } from "./-details";
import { OrganizationLevelsCard } from "./-levels";
import { OrganizationLogoCard } from "./-logo";
import { OrganizationSocialsCard } from "./-socials";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/general/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(levelOptions.list());
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const updateOrganization = useUpdateOrganization();

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Logo"
        description="Update your organization's logo to make it easier to identify."
      >
        <OrganizationLogoCard />
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Organization details"
        description="Basic details about your organization."
      >
        <OrganizationDetails />
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Public join"
        description="Allow any user to join your organization without an invitation."
      >
        <Card>
          <CardContent>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="allowSameDayBookings">
                Allow public join
              </FieldLabel>
              <Switch
                id="allowPublicJoin"
                checked={organization.allowPublicJoin}
                onCheckedChange={(value) =>
                  updateOrganization.mutateAsync({
                    organizationId: organization.id,
                    allowPublicJoin: value,
                  })
                }
              />
            </Field>
          </CardContent>
        </Card>
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Socials"
        description="Social media accounts for your organization."
      >
        <OrganizationSocialsCard />
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Levels"
        description="Levels that the riders in your organization can be set at."
      >
        <OrganizationLevelsCard />
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}
