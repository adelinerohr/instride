import { createFileRoute } from "@tanstack/react-router";

import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";

import { PersonalDetails } from "./-details";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/account/profile/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Personal details"
        description="Set your name and contact information, the email address entered here is used for your login access."
      >
        <PersonalDetails />
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}
