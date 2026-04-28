import { authOptions, useSignOut, type AuthUser } from "@instride/api";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";

/**
 * Path: /org/[slug]/(non-member)
 * Description: Session required, membership optional. Houses routes for users
 * who are authenticated but haven't completed (or started) onboarding —
 * e.g. /onboarding and /invitation. Fully onboarded members get bounced
 * back into the app. Users with a pending guardian invitation are forced
 * to the invitation page.
 */

export const Route = createFileRoute("/org/$slug/(non-member)")({
  component: RouteComponent,
  beforeLoad: async ({ context, params, location }) => {
    const session = await context.queryClient.ensureQueryData(
      authOptions.session()
    );

    if (!session?.user) {
      throw Route.redirect({
        to: "/org/$slug/auth/login",
        params,
        search: {
          redirect: location.pathname + location.searchStr,
        },
      });
    }

    const isOnInvitationRoute = location.pathname.includes("/invitation/");

    // Fully onboarded members don't belong here — send them into the app.
    // Exception: allow onboarded users to view invitations (e.g., an existing
    // org member receiving a new invitation).
    if (context.member?.onboardingComplete && !isOnInvitationRoute) {
      throw Route.redirect({ to: "/org/$slug", params });
    }

    // Check for a pending guardian invitation. If one exists, the user MUST
    // accept it to proceed — their placeholder member record blocks normal
    // onboarding.
    if (!isOnInvitationRoute) {
      if (
        context.pendingGuardianInvitation &&
        context.pendingGuardianInvitation.organizationSlug === params.slug
      ) {
        throw Route.redirect({
          to: "/org/$slug/invitation/$token",
          params: { ...params, token: context.pendingGuardianInvitation.token },
          search: {
            type: "guardian",
          },
        });
      }
    }

    const user: AuthUser = {
      ...session.user,
      image: session.user.image ?? null,
      imageKey: session.user.imageKey ?? null,
      phone: session.user.phone ?? null,
      profilePictureUrl: session.user.profilePictureUrl ?? null,
      role: session.user.role ?? null,
      banned: session.user.banned ?? null,
      banReason: session.user.banReason ?? null,
      banExpires: session.user.banExpires?.toISOString() ?? null,
      dateOfBirth: session.user.dateOfBirth ?? null,
      createdAt: session.user.createdAt.toISOString(),
      updatedAt: session.user.updatedAt.toISOString(),
    };

    return {
      user,
      session: session.session,
      member: context.member, // Member | null — preserves partial onboarding state
    };
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const router = useRouter();
  const navigate = Route.useNavigate();

  const signOut = useSignOut({
    mutationConfig: {
      onSuccess: async () => {
        await router.invalidate();
        navigate({
          to: "/org/$slug/auth/login",
          params: { slug: organization.slug },
        });
      },
    },
  });

  return (
    <div className="min-h-svh overflow-y-auto bg-muted/40 relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={() => signOut.mutate({})}
      >
        Sign out
      </Button>
      <Outlet />
    </div>
  );
}
