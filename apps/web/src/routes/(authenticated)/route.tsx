import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/shared/lib/auth/client";

export const Route = createFileRoute("/(authenticated)")({
  component: Outlet,
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    const { data } = await authClient.getSession();

    if (!data?.user) {
      throw redirect({ to: "/login" });
    }

    return { user: data.user, session: data.session };
  },
});
