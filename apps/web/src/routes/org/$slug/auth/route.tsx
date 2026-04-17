import { organizationOptions } from "@instride/api";
import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/auth")({
  component: Outlet,
  beforeLoad: async ({ context, params }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/org/$slug",
        params,
      });
    }

    try {
      const org = await context.queryClient.ensureQueryData(
        organizationOptions.bySlug(params.slug)
      );

      if (!org) {
        throw notFound();
      }

      return { org };
    } catch {
      throw notFound();
    }
  },
});
