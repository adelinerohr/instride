import { guardianOptions } from "@instride/api";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { GuardianInvitationCard } from "@/features/organization/components/guardians/invitation-card";
import { OrganizationInvitationCard } from "@/features/organization/components/members/invitation-card";
import { InvalidInvitationCard } from "@/shared/components/auth/invitation-error";
import { Button } from "@/shared/components/ui/button";
import { authClient } from "@/shared/lib/auth/client";

export const Route = createFileRoute(
  "/org/$slug/(non-member)/invitation/$token"
)({
  component: RouteComponent,
  errorComponent: InvalidInvitationCard,
  validateSearch: z.object({
    type: z.enum(["guardian", "organization"]),
  }),
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps, context, location }) => {
    console.log("[/invitation/$token] incoming location:", location);

    if (deps.type === "organization") {
      const { data, error } = await authClient.organization.getInvitation({
        query: { id: params.token },
      });
      if (error) throw error;
      return { type: "organization" as const, invitation: data };
    }

    const invitation = await context.queryClient.ensureQueryData(
      guardianOptions.invitationByToken(params.token)
    );

    return { type: "guardian" as const, invitation };
  },
});

function RouteComponent() {
  const { type, invitation } = Route.useLoaderData();
  const { user, organization } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = Route.useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    await router.invalidate();
    navigate({
      to: "/org/$slug/auth/login",
      params: { slug: organization.slug },
    });
  };

  return (
    <div className="min-h-svh overflow-y-auto bg-muted/40 relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={handleSignOut}
      >
        Sign out
      </Button>
      <div className="mx-auto max-w-sm pt-48">
        {type === "organization" ? (
          <OrganizationInvitationCard
            invitationId={invitation.id}
            invitationEmail={invitation.email}
            user={user}
            organization={organization}
          />
        ) : (
          <GuardianInvitationCard invitation={invitation} user={user} />
        )}
      </div>
    </div>
  );
}
