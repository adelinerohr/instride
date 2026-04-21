import {
  APIError,
  ErrCode,
  membersOptions,
  organizationOptions,
  setOrganizationContext,
} from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Path: /org/[slug]
 * Description: Main organization route, loads organization
 *   1. Get organization by slug
 *   2. Confirm organization exists, if not redirect to home
 *   3. Check if current route is a public auth route
 *   4. If not authenticated and not a public auth route, redirect to login
 *   5. Publish the org context so every subsequent API call carries
 *      X-Organization-Id, then load the current member
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

    // Authenticated + non-public route: resolve the org first so we can
    // publish the org context before any endpoints that require org auth
    const organization = await context.queryClient.ensureQueryData(
      organizationOptions.bySlug(params.slug)
    );

    if (!organization) {
      throw Route.redirect({ to: "/" });
    }

    setOrganizationContext(organization.id);

    const member = await context.queryClient
      .ensureQueryData(membersOptions.me())
      .catch((error) => {
        if (error instanceof APIError && error.code === ErrCode.NotFound)
          return null;
        throw error;
      });

    const isPortal = location.pathname.includes("/portal");

    return { organization, isPortal, member };
  },
});
