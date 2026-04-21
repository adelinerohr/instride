import {
  APIError,
  authOptions,
  ErrCode,
  membersOptions,
  organizationOptions,
} from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { authClient } from "@/shared/lib/auth/client";

/**
 * Path: /org/[slug]
 * Description: Main organization route, loads organization
 *   1. Get organization by slug
 *   2. Confirm organization exists, if not redirect to home
 *   3. Check if current route is a public auth route
 *   4. If not authenticated and not a public auth route, redirect to login
 *   5. Check if the active organization in the session is the same as the organization in the route
 *   6. If authenticated and a public auth route, return organization and isPortal false
 */
export const Route = createFileRoute("/org/$slug")({
  component: Outlet,
  beforeLoad: async ({ params, context, location }) => {
    const [organization, member] = await Promise.all([
      context.queryClient.ensureQueryData(
        organizationOptions.bySlug(params.slug)
      ),
      context.queryClient
        .ensureQueryData(membersOptions.me())
        .catch((error) => {
          if (error instanceof APIError && error.code === ErrCode.NotFound)
            return null;
          throw error;
        }),
    ]);

    if (!organization) {
      throw Route.redirect({ to: "/" });
    }

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

    const currentActiveOrgId = context.session?.activeOrganizationId;
    const orgChanged = currentActiveOrgId !== organization.authOrganizationId;

    if (orgChanged) {
      const [{ error }, { error: organizationError }] = await Promise.all([
        authClient.updateSession({
          contextOrganizationId: organization.id,
        } as Parameters<typeof authClient.updateSession>[0]),
        authClient.organization.setActive({
          organizationId: organization.authOrganizationId,
          organizationSlug: organization.slug,
        }),
      ]);

      if (error || organizationError) {
        console.error(error, organizationError);
        throw Route.redirect({ to: "/" });
      }

      await Promise.all([
        context.queryClient.invalidateQueries({
          queryKey: authOptions.session().queryKey,
        }),
        context.queryClient.invalidateQueries({
          queryKey: membersOptions.me().queryKey,
        }),
      ]);
    }

    return { organization, isPortal, member };
  },
});
