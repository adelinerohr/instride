import {
  APIError,
  authClient,
  ErrCode,
  getOrganizationContext,
  guardianOptions,
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
 *
 * RACE SAFETY (org switch):
 *   When the active org changes, in-flight queries scoped to the previous
 *   org could land *after* we've switched context. Their responses would
 *   then populate the TanStack cache under the new org's keys — leaking
 *   data across boundaries. We cancel those queries before the switch.
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

    // If the org context is changing, cancel any in-flight queries and drop org-
    // scoped cache entries before publishing the new context.
    const previousOrganizationId = getOrganizationContext();
    if (previousOrganizationId !== organization.id) {
      await context.queryClient.cancelQueries();

      // Drop everything except auth queries
      if (previousOrganizationId !== null) {
        context.queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== "auth",
        });
      }
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

    const pendingGuardianInvitation = await context.queryClient.ensureQueryData(
      guardianOptions.pendingInvitation()
    );

    const { data: pendingInvitations } =
      await authClient.organization.listUserInvitations();
    const pendingOrganizationInvitation = pendingInvitations?.find(
      (invitation) =>
        invitation.organizationId === organization.authOrganizationId
    );

    const isPortal = location.pathname.includes("/portal");

    return {
      organization,
      isPortal,
      member,
      pendingGuardianInvitation,
      pendingOrganizationInvitation,
    };
  },
});
