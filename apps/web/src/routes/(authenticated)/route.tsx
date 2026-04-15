import { authOptions } from "@instride/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)")({
  component: Outlet,
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }

    const { session } = await context.queryClient.ensureQueryData(
      authOptions.session()
    );

    if (!session) {
      throw redirect({ to: "/auth/login" });
    }

    return { user: session.user, session: session };
  },
});
