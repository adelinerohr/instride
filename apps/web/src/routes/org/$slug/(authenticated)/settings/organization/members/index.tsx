import { invitationOptions, membersOptions } from "@instride/api";
import { createFileRoute } from "@tanstack/react-router";

import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Separator } from "@/shared/components/ui/separator";

import { TeamMembersCard } from "./-invitations";
import { InviteMember } from "./-invite";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/members/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(invitationOptions.list()),
      context.queryClient.ensureQueryData(membersOptions.all()),
    ]);
  },
});

function RouteComponent() {
  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Invite Member"
        description="Send an invite to a team member by email and assign them a role."
      >
        <InviteMember />
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Team Members"
        description="See all active members and the pending invites of your organization."
      >
        <TeamMembersCard />
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}
