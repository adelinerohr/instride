import { authOptions, type AuthUser } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ImpersonationBanner } from "@/shared/components/auth/impersonation-banner";
import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { ModalScope } from "@/shared/lib/stores/modal.store";

/**
 * Path: /org/[slug]/(authenticated)
 * Description: Session AND completed membership required. Every route under
 * this layout can rely on `context.member` being a non-null, fully-onboarded
 * Member. Non-members and partially-onboarded members are redirected to
 * /onboarding before any child route resolves.
 */
export const Route = createFileRoute("/org/$slug/(authenticated)")({
  component: RouteComponent,
  beforeLoad: async ({ context, location, params }) => {
    const session = await context.queryClient.ensureQueryData(
      authOptions.session()
    );

    if (!session?.user) {
      throw Route.redirect({
        to: "/org/$slug/auth/login",
        params,
        search: {
          redirect: location.pathname + location.searchStr,
        },
      });
    }

    const member = context.member;

    if (!member) {
      throw Route.redirect({ to: "/org/$slug/onboarding", params });
    }

    if (!member.onboardingComplete) {
      throw Route.redirect({ to: "/org/$slug/onboarding", params });
    }

    const user: AuthUser = {
      ...session.user,
      image: session.user.image ?? null,
      imageKey: session.user.imageKey ?? null,
      phone: session.user.phone ?? null,
      profilePictureUrl: session.user.profilePictureUrl ?? null,
      role: session.user.role ?? null,
      banned: session.user.banned ?? null,
      banReason: session.user.banReason ?? null,
      dateOfBirth: session.user.dateOfBirth ?? null,
      createdAt: session.user.createdAt.toISOString(),
      updatedAt: session.user.updatedAt.toISOString(),
      banExpires: session.user.banExpires?.toISOString() ?? null,
    };

    const isPortal = location.pathname.includes("/portal");

    return {
      user,
      session: session.session,
      member, // narrowed to Member (non-null)
      isPortal,
    };
  },
});

function RouteComponent() {
  return (
    <ModalScope modals={[ConfirmationModal]}>
      <ImpersonationBanner />
      <Outlet />
    </ModalScope>
  );
}
