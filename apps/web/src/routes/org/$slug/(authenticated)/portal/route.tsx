import { guardianOptions, guardians, type types } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

type OnlyGuardianContext = {
  isGuardian: true;
  isOnlyGuardian: true;
  dependents: guardians.GetMyDependendentsResponse;
  effectiveRiderIds: string[];
};

type GuardianContext = {
  isGuardian: true;
  isOnlyGuardian: false;
  rider: types.Rider;
  dependents: guardians.GetMyDependendentsResponse;
  effectiveRiderIds: string[];
};

type RiderContext = {
  isGuardian: false;
  isDependent: false;
  rider: types.Rider;
  effectiveRiderIds: string[];
};

type DependentContext = {
  isGuardian: false;
  isDependent: true;
  rider: types.Rider;
  permissions: types.GuardianPermissions;
  effectiveRiderIds: string[];
};

export type PortalContext =
  | OnlyGuardianContext
  | GuardianContext
  | RiderContext
  | DependentContext;

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

    const [guardianRelationship, dependentRelationships] = await Promise.all([
      rider?.isRestricted
        ? context.queryClient.ensureQueryData(guardianOptions.myGuardian())
        : Promise.resolve(null),
      isGuardian
        ? context.queryClient.ensureQueryData(guardianOptions.myDependents())
        : Promise.resolve(null),
    ]);

    if (
      isGuardian &&
      dependentRelationships &&
      dependentRelationships.length > 0
    ) {
      // Guardian-only: no rider profile of their own
      if (!rider) {
        return {
          isGuardian: true,
          isOnlyGuardian: true,
          dependents: dependentRelationships,
          effectiveRiderIds: dependentRelationships.map(
            ({ dependent }) => dependent.riderId
          ),
        };
      }
      // Guardian who also has their own rider profile
      if (rider) {
        return {
          isGuardian: true,
          isOnlyGuardian: false,
          rider,
          dependents: dependentRelationships,
          effectiveRiderIds: [
            rider.id,
            ...dependentRelationships.map(({ dependent }) => dependent.riderId),
          ],
        };
      }
    }

    // From here: !isGuardian, so rider must be non-null (the !rider && !isGuardian
    // case was redirected above)
    if (!rider) {
      throw new Error("Rider is required");
    }

    // Dependent: restricted rider whose guardian relationship is loaded
    if (rider.isRestricted && guardianRelationship) {
      return {
        isGuardian: false,
        isDependent: true,
        rider,
        permissions: guardianRelationship.permissions,
        effectiveRiderIds: [rider.id],
      };
    }

    // Plain rider
    return {
      isGuardian: false,
      isDependent: false,
      rider,
      effectiveRiderIds: [rider.id],
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
