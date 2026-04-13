import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SettingsPage } from "@/shared/components/layout/settings-page";
import { SettingsSidebar } from "@/shared/components/layout/settings-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
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
  return (
    <SidebarProvider>
      <SettingsSidebar />
      <SidebarInset className="max-h-screen min-h-screen overflow-hidden">
        <main className="flex flex-col flex-1 min-h-0">
          <SettingsPage>
            <Outlet />
          </SettingsPage>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
