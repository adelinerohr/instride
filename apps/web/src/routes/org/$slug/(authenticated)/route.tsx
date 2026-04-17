import { authOptions, membersOptions } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Path: /org/[slug]/(authenticated)
 * Description: Checks membership and onboarding status
 */
export const Route = createFileRoute("/org/$slug/(authenticated)")({
  component: Outlet,
  beforeLoad: async ({ context }) => {
    // 1. must be authenticated
    if (!context.isAuthenticated) {
      throw Route.redirect({
        to: "/org/$slug/auth/login",
      });
    }

    // 2. get session
    const { session } = await context.queryClient.ensureQueryData(
      authOptions.session()
    );
    if (!session?.user) {
      throw Route.redirect({
        to: "/org/$slug/auth/login",
      });
    }

    // 3. must be a member
    const member = await context.queryClient.ensureQueryData(
      membersOptions.me()
    );

    if (!member) {
      throw Route.redirect({ to: "/" });
    }

    return {
      user: session.user,
      member: {
        ...member!,
        roles: member.roles!,
      },
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
