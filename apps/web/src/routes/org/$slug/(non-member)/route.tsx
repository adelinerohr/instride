import { authOptions, type types } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Path: /org/[slug]/(non-member)
 * Description: Session required, membership optional. Houses routes for users
 * who are authenticated but haven't completed (or started) onboarding —
 * e.g. /onboarding and /invitation/:token. Fully onboarded members get
 * bounced back into the app.
 */
export const Route = createFileRoute("/org/$slug/(non-member)")({
  component: Outlet,
  beforeLoad: async ({ context, params }) => {
    const session = await context.queryClient.ensureQueryData(
      authOptions.session()
    );

    if (!session?.user) {
      throw Route.redirect({ to: "/org/$slug/auth/login", params });
    }

    // Fully onboarded members don't belong here — send them into the app.
    if (context.member?.onboardingComplete) {
      throw Route.redirect({ to: "/org/$slug", params });
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
      member: context.member, // Member | null — preserves partial onboarding state
    };
  },
});
