import {
  boardAssignmentsOptions,
  guardianOptions,
  type GuardianPermissions,
  type MyDependent,
  type Rider,
} from "@instride/api";
import { MembershipRole } from "@instride/shared";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";

import { AppLayout } from "@/shared/components/layout/app-layout";
import { Page, PageBody } from "@/shared/components/layout/page";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

type OnlyGuardianContext = {
  isGuardian: true;
  isOnlyGuardian: true;
  dependents: MyDependent[];
  effectiveRiderIds: string[];
  hasAssignedBoards: boolean;
};

type GuardianContext = {
  isGuardian: true;
  isOnlyGuardian: false;
  rider: Rider;
  dependents: MyDependent[];
  effectiveRiderIds: string[];
  hasAssignedBoards: boolean;
};

type RiderContext = {
  isGuardian: false;
  isDependent: false;
  rider: Rider;
  effectiveRiderIds: string[];
  hasAssignedBoards: boolean;
};

type DependentContext = {
  isGuardian: false;
  isDependent: true;
  rider: Rider;
  permissions: GuardianPermissions;
  effectiveRiderIds: string[];
  hasAssignedBoards: boolean;
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

    const getHasAssignedBoards = async (
      effectiveRiderIds: string[]
    ): Promise<boolean> => {
      if (effectiveRiderIds.length === 0) return false;
      const assignments = await Promise.all(
        effectiveRiderIds.map(async (riderId) =>
          context.queryClient.ensureQueryData(
            boardAssignmentsOptions.byRider(riderId)
          )
        )
      );
      return assignments.some((a) => a.length > 0);
    };

    if (isGuardian && dependentRelationships) {
      // Guardian-only: no rider profile of their own.
      // If they have no dependents yet, we still allow the portal route to load
      // so the layout can show an empty state prompting them to add one.
      if (!rider) {
        const effectiveRiderIds = dependentRelationships.map(
          (dependent) => dependent.rider.id
        );
        return {
          isGuardian: true,
          isOnlyGuardian: true,
          dependents: dependentRelationships,
          effectiveRiderIds,
          hasAssignedBoards:
            effectiveRiderIds.length === 0
              ? false
              : await getHasAssignedBoards(effectiveRiderIds),
        };
      }

      // Guardian who also has their own rider profile
      const effectiveRiderIds = [
        rider.id,
        ...dependentRelationships.map((dependent) => dependent.rider.id),
      ];
      return {
        isGuardian: true,
        isOnlyGuardian: false,
        rider,
        dependents: dependentRelationships,
        effectiveRiderIds,
        hasAssignedBoards: await getHasAssignedBoards(effectiveRiderIds),
      };
    }

    // From here: !isGuardian, so rider must be non-null (the !rider && !isGuardian
    // case was redirected above)
    if (!rider) {
      throw new Error("Rider is required");
    }

    // Dependent: restricted rider whose guardian relationship is loaded
    if (
      rider.isRestricted &&
      guardianRelationship &&
      guardianRelationship.relationships?.length > 0
    ) {
      const effectiveRiderIds = [rider.id];
      return {
        isGuardian: false,
        isDependent: true,
        rider,
        permissions: guardianRelationship.relationships[0].permissions,
        effectiveRiderIds,
        hasAssignedBoards: await getHasAssignedBoards(effectiveRiderIds),
      };
    }

    // Plain rider
    const effectiveRiderIds = [rider.id];
    return {
      isGuardian: false,
      isDependent: false,
      rider,
      effectiveRiderIds,
      hasAssignedBoards: await getHasAssignedBoards(effectiveRiderIds),
    };
  },
});

function RouteComponent() {
  const { hasAssignedBoards, effectiveRiderIds } = Route.useRouteContext();
  const routeContext = Route.useRouteContext();
  const { slug } = Route.useParams();

  if (
    routeContext.isGuardian &&
    routeContext.isOnlyGuardian &&
    routeContext.dependents.length === 0
  ) {
    return (
      <AppLayout type="portal" isAdmin={false}>
        <Page className="min-h-0 flex-1">
          <PageBody className="flex flex-1 items-center justify-center">
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircleIcon />
                </EmptyMedia>
                <EmptyTitle>No dependents</EmptyTitle>
                <EmptyDescription>
                  You don&apos;t have any dependents yet. Add a dependent to use
                  the portal.
                </EmptyDescription>
              </EmptyHeader>
              <Link
                to="/org/$slug/settings/account/guardian"
                params={{ slug }}
                className={buttonVariants({ variant: "default" })}
              >
                Manage Dependents
              </Link>
            </Empty>
          </PageBody>
        </Page>
      </AppLayout>
    );
  }

  return (
    <AppLayout type="portal" isAdmin={false}>
      {!hasAssignedBoards && effectiveRiderIds.length > 0 ? (
        <Page className="min-h-0 flex-1">
          <PageBody className="flex flex-1 items-center justify-center">
            <Empty className="max-w-lg">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircleIcon />
                </EmptyMedia>
                <EmptyTitle>No boards assigned</EmptyTitle>
                <EmptyDescription>
                  You aren&apos;t assigned to any boards yet. Please reach out
                  to an administrator to be added to a board.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </PageBody>
        </Page>
      ) : (
        <Outlet />
      )}
    </AppLayout>
  );
}
