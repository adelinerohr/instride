import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppLayout } from "@/shared/components/layout/app-layout";
import { SettingsPage } from "@/shared/components/layout/settings-page";
import { hasRole } from "@/shared/lib/auth/roles";

export const Route = createFileRoute("/org/$slug/(authenticated)/settings")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const isAdmin = hasRole(context.member, MembershipRole.ADMIN);
    const isTrainer = hasRole(context.member, MembershipRole.TRAINER);

    return {
      isAdmin,
      isTrainer,
    };
  },
});

function RouteComponent() {
  const { isAdmin } = Route.useRouteContext();

  return (
    <AppLayout type="settings" isAdmin={isAdmin}>
      <SettingsPage>
        <Outlet />
      </SettingsPage>
    </AppLayout>
  );
}
