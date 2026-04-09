import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/(unauthenticated)")({
  component: Outlet,
  beforeLoad: ({ context, params }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/org/$slug",
        params,
      });
    }
  },
});
