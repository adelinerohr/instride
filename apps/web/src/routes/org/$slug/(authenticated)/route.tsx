import { authOptions, membersOptions } from "@instride/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * Path: /org/[slug]/(authenticated)
 * Description: Checks membership and onboarding status
 */
export const Route = createFileRoute("/org/$slug/(authenticated)")({
  component: Outlet,
  beforeLoad: async ({ context, params }) => {
    // 1. must be authenticated
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/org/$slug/login",
        params,
      });
    }

    // 2. get session
    const { session } = await context.queryClient.ensureQueryData(
      authOptions.session()
    );
    if (!session?.user) {
      throw redirect({
        to: "/org/$slug/login",
        params,
      });
    }

    // 3. must be a member
    const member = await context.queryClient.ensureQueryData(
      membersOptions.me()
    );

    if (!member) {
      throw redirect({ to: "/" });
    }

    // 4. must be onboarded

    return {
      user: session.user,
      member: {
        ...member!,
        roles: member.roles!,
      },
    };
  },
});
