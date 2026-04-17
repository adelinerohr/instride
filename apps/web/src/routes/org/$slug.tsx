import { organizationOptions } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { authClient } from "@/shared/lib/auth/client";

/**
 * Path: /org/[slug]
 * Description: Main organization route, loads organization
 */
export const Route = createFileRoute("/org/$slug")({
  component: Outlet,
  beforeLoad: async ({ params, context, location }) => {
    const organization = await context.queryClient.ensureQueryData(
      organizationOptions.bySlug(params.slug)
    );

    if (!organization) {
      throw Route.redirect({ to: "/" });
    }

    // Check if current route is a public auth route
    const isPublicRoute = location.pathname.includes("auth");

    if (!context.isAuthenticated) {
      if (isPublicRoute) {
        return {
          organization,
          isPortal: false,
        };
      }
      throw Route.redirect({
        to: "/org/$slug/auth/login",
      });
    }

    const isPortal = location.pathname.includes("/portal");

    // Set active organization in session
    const { error } = await authClient.updateSession({
      contextOrganizationId: organization.id,
    } as Parameters<typeof authClient.updateSession>[0]);

    const { error: organizationError } =
      await authClient.organization.setActive({
        organizationId: organization.authOrganizationId,
        organizationSlug: organization.slug,
      });

    if (error || organizationError) {
      console.error(error, organizationError);
      throw Route.redirect({ to: "/" });
    }

    return { organization, isPortal };
  },
});
