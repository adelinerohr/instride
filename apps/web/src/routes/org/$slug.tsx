import { organizationOptions } from "@instride/api";
import { registerRuntime } from "@instride/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/shared/lib/auth-client";
/**
 * Path: /org/[slug]
 * Description: Main organization route, loads organization
 */
export const Route = createFileRoute("/org/$slug")({
  component: Outlet,
  beforeLoad: async ({ params, context }) => {
    const organization = await context.queryClient.ensureQueryData(
      organizationOptions.bySlug(params.slug)
    );

    if (!organization) {
      throw redirect({ to: "/" });
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
