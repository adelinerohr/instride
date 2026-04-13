import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SettingsPage } from "@/shared/components/layout/settings-page";
import { SettingsSidebar } from "@/shared/components/layout/settings-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { isAdmin } from "@/shared/lib/auth/roles";

export const Route = createFileRoute("/org/$slug/(authenticated)/settings")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const canViewAdminSettings = isAdmin(context.member);

    return {
      isAdmin: canViewAdminSettings,
    };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <SettingsSidebar />
      <SidebarInset className="max-h-screen min-h-0 overflow-hidden">
        <main className="flex flex-col flex-1 min-h-0">
          <SettingsPage>
            <Outlet />
          </SettingsPage>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
