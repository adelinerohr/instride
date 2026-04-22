import { hasAnyRole } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

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
    <SidebarProvider className="max-w-screen">
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
