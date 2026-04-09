import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export const Route = createFileRoute("/org/$slug/(authenticated)/portal")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar type="portal" />
      <SidebarInset className="max-h-screen min-h-0 overflow-hidden">
        <AppHeader type="portal" />
        <main className="flex flex-col flex-1 min-h-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
