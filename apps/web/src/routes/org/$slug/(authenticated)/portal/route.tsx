import { guardianOptions } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export const Route = createFileRoute("/org/$slug/(authenticated)/portal")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const rider = context.member.rider ?? null;
    const isGuardian = context.member.roles.includes(MembershipRole.GUARDIAN);

    if (!rider && !isGuardian) {
      throw Error("NO_PORTAL_ACCESS");
    }

    if (isGuardian) {
      const dependents = await context.queryClient.fetchQuery(
        guardianOptions.myDependents()
      );

      return {
        ...context,
        rider,
        isGuardian: true,
        isOnlyGuardian: rider === null && isGuardian,
        dependents,
      };
    }

    return {
      ...context,
      rider,
      isGuardian: false,
      isOnlyGuardian: false,
      dependents: null,
    };
  },
  errorComponent: ({ error }) => {
    if (error.message === "NO_PORTAL_ACCESS") {
      return (
        <div className="flex flex-col items-center justify-center h-full pt-64 gap-2">
          <h1 className="text-2xl font-bold">You don't have portal access</h1>
          <p className="text-sm text-muted-foreground">
            Please contact your administrator to add you to the portal.
          </p>
        </div>
      );
    }
  },
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
