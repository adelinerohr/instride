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
    const isPublicRoute = location.pathname.includes("auth");

    // Public routes: only fetch the org, no auth-requiring calls
    if (isPublicRoute || !context.isAuthenticated) {
      const organization = await context.queryClient.ensureQueryData(
        organizationOptions.bySlug(params.slug)
      );

      if (!organization) {
        throw Route.redirect({ to: "/" });
      }

      if (!context.isAuthenticated) {
        if (isPublicRoute) {
          return { organization, isPortal: false };
        }
        throw Route.redirect({ to: "/org/$slug/auth/login" });
      }

      // Authenticated but on a public route (like login) — let them through
      // with minimal data; the app can redirect them away if needed
      return { organization, isPortal: false };
    }

    // Authenticated + non-public route: fetch everything
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

    const isPortal = location.pathname.includes("/portal");
    const currentActiveOrgId = context.session?.contextOrganizationId;
    const orgChanged = currentActiveOrgId !== organization.id;

    if (orgChanged) {
      const { error: updateError } = await authClient.updateSession({
        contextOrganizationId: organization.id,
      } as Parameters<typeof authClient.updateSession>[0]);
      if (updateError) {
        console.error(updateError);
        throw Route.redirect({ to: "/" });
      }

      await Promise.all([
        context.queryClient.refetchQueries({
          queryKey: authOptions.session().queryKey,
        }),
        context.queryClient.refetchQueries({
          queryKey: membersOptions.me().queryKey,
        }),
      ]);
    }

    return { organization, isPortal, member };
  },
});
