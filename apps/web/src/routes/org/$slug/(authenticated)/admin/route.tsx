import { hasAnyRole } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppLayout } from "@/shared/components/layout/app-layout";

export const Route = createFileRoute("/org/$slug/(authenticated)/admin")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const canViewAdmin = hasAnyRole(context.member, [
      MembershipRole.ADMIN,
      MembershipRole.TRAINER,
    ]);

    if (!canViewAdmin) {
      throw redirect({ to: "/org/$slug/portal", params });
    }

    const trainerId = context.member.trainer?.id;

    return {
      trainerId,
    };
  },
});

function RouteComponent() {
  return (
    <AppLayout type="admin" isAdmin={true}>
      <Outlet />
    </AppLayout>
  );
}
