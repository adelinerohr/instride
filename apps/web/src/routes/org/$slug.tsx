import { organizationOptions } from "@instride/api";
import { registerRuntime } from "@instride/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/shared/lib/auth/client";
/**
 * Path: /org/[slug]
 * Description: Main organization route, loads organization
 */
function isPublicOrgRoute(slug: string, pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  const base = `/org/${slug}`;
  return (
    path === `${base}/login` ||
    path === `${base}/register` ||
    path.startsWith(`${base}/auth`)
  );
}

export const Route = createFileRoute("/org/$slug")({
  component: Outlet,
  beforeLoad: async ({ params, context, location }) => {
    const organization = await context.queryClient.ensureQueryData(
      organizationOptions.bySlug(params.slug)
    );

    if (!organization) {
      throw redirect({ to: "/" });
    }

    if (!context.isAuthenticated) {
      if (isPublicOrgRoute(organization.slug, location.pathname)) {
        registerRuntime({
          getOrganizationId: () => organization.id,
        });
        return {
          organization,
          isPortal: location.pathname.includes("/portal"),
        };
      }
      throw redirect({
        to: "/org/$slug/login",
        params: { slug: organization.slug },
      });
    }

    registerRuntime({
      getOrganizationId: () => organization.id,
    });

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
      throw redirect({ to: "/" });
    }

    return { organization, isPortal };
  },
});
