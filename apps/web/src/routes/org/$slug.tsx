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
 * Description: Main organization route.
 *   1. Resolve the organization by slug (redirect home if it doesn't exist).
 *   2. Public auth routes (/auth/*) short-circuit here — no session/member lookups.
 *   3. Unauthenticated users get bounced to the org's login page.
 *   4. Authenticated users publish the org context (so every subsequent API
 *      call carries X-Organization-Id) and then resolve membership.
 *   5. `member` on context is `Member | null`. Children decide how to react:
 *      - (non-member) accepts both.
 *      - (authenticated) requires non-null and onboardingComplete.
 */
export const Route = createFileRoute("/org/$slug")({
  component: Outlet,
  beforeLoad: async ({ params, context, location }) => {
    const isPublicAuthRoute = location.pathname.includes("/auth/");

    const organization = await context.queryClient.ensureQueryData(
      organizationOptions.bySlug(params.slug)
    );

    if (!organization) {
      throw Route.redirect({ to: "/" });
    }

    if (isPublicAuthRoute) {
      return { organization, isPortal: false, member: null };
    }

    if (!context.isAuthenticated) {
      throw Route.redirect({ to: "/org/$slug/auth/login", params });
    }

    setOrganizationContext(organization.id);

    const member = await context.queryClient
      .ensureQueryData(membersOptions.me())
      .catch((error) => {
        if (error instanceof APIError && error.code === ErrCode.NotFound) {
          return null;
        }
        throw error;
      });

    const isPortal = location.pathname.includes("/portal");

    return { organization, isPortal, member };
  },
});
