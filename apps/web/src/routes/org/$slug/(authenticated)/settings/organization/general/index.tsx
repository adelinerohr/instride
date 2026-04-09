import { levelOptions } from "@instride/api";
import { createFileRoute } from "@tanstack/react-router";

import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Separator } from "@/shared/components/ui/separator";

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
