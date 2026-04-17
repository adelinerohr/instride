import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { isAdmin } from "@/shared/lib/auth/roles";

export const Route = createFileRoute("/org/$slug/(authenticated)/admin")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const canViewAdmin = isAdmin(context.member);

    if (!canViewAdmin) {
      throw redirect({ to: "/org/$slug/portal", params });
    }
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar type="admin" />
      <SidebarInset className="max-h-screen min-h-screen overflow-hidden">
        <AppHeader type="admin" />
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
