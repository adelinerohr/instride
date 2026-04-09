import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(unauthenticated)")({
  component: Outlet,
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/",
      });
    }
  },
});
