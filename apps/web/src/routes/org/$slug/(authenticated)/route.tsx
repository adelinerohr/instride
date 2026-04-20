import { authOptions, type types } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ImpersonationBanner } from "@/shared/components/auth/impersonation-banner";

/**
 * Path: /org/[slug]/(authenticated)
 * Description: Checks membership and onboarding status
 */
export const Route = createFileRoute("/org/$slug/(authenticated)")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      authOptions.session()
    );

    if (!session?.user) {
      throw Route.redirect({
        to: "/org/$slug/auth/login",
      });
    }

    if (!context.member) {
      throw Route.redirect({ to: "/org/$slug/onboarding" });
    }

    const user: types.AuthUser = {
      ...session.user,
      createdAt: session.user.createdAt.toISOString(),
      updatedAt: session.user.updatedAt.toISOString(),
      banExpires: session.user.banExpires?.toISOString() ?? null,
    };

    return {
      user,
      session: session.session,
      member: context.member,
    };
  },
  loader: async ({ context, location }) => {
    if (
      !context.member.onboardingComplete &&
      !location.pathname.includes("onboarding")
    ) {
      throw Route.redirect({ to: "/org/$slug/onboarding" });
    }
  },
});

function RouteComponent() {
  return (
    <>
      <ImpersonationBanner />
      <Outlet />
    </>
  );
}
