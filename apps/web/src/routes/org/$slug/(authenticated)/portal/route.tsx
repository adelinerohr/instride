import { guardianOptions } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export const Route = createFileRoute("/org/$slug/(authenticated)/portal")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const rider = context.member.rider;
    const isGuardian = context.member.roles.includes(MembershipRole.GUARDIAN);

    // Members who are not riders or guardians are not allowed to access the portal
    if (!rider && !isGuardian) {
      throw redirect({
        to: "/org/$slug",
        params: { slug: params.slug },
      });
    }

    const guardian =
      rider && rider.isRestricted
        ? await context.queryClient.ensureQueryData(
            guardianOptions.myGuardian()
          )
        : null;

    const dependents = isGuardian
      ? await context.queryClient.ensureQueryData(
          guardianOptions.myDependents()
        )
      : null;

    return {
      rider: rider
        ? {
            ...rider,
            permissions: guardian?.permissions ?? null,
          }
        : null,
      isGuardian,
      isOnlyGuardian: isGuardian && !rider,
      dependents,
    };
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
