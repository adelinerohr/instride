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
  effectiveRiders: Rider[];
  hasAssignedBoards: boolean;
};

type GuardianContext = {
  isGuardian: true;
  isOnlyGuardian: false;
  rider: Rider;
  dependents: MyDependent[];
  effectiveRiders: Rider[];
  hasAssignedBoards: boolean;
};

type RiderContext = {
  isGuardian: false;
  isDependent: false;
  rider: Rider;
  effectiveRiders: Rider[];
  hasAssignedBoards: boolean;
};

type DependentContext = {
  isGuardian: false;
  isDependent: true;
  rider: Rider;
  permissions: GuardianPermissions;
  effectiveRiders: Rider[];
  hasAssignedBoards: boolean;
};

export type PortalRouteContext =
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
      effectiveRiders: Rider[]
    ): Promise<boolean> => {
      if (effectiveRiders.length === 0) return false;
      const assignments = await Promise.all(
        effectiveRiders.map(async (rider) =>
          context.queryClient.ensureQueryData(
            boardAssignmentsOptions.byRider(rider.id)
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
        const effectiveRiders = dependentRelationships.map(
          (dependent) => dependent.rider
        );
        return {
          isGuardian: true,
          isOnlyGuardian: true,
          dependents: dependentRelationships,
          effectiveRiders,
          hasAssignedBoards:
            effectiveRiders.length === 0
              ? false
              : await getHasAssignedBoards(effectiveRiders),
        } satisfies OnlyGuardianContext;
      }

      // Guardian who also has their own rider profile
      const effectiveRiders = [
        rider,
        ...dependentRelationships.map((dependent) => dependent.rider),
      ];
      return {
        isGuardian: true,
        isOnlyGuardian: false,
        rider,
        dependents: dependentRelationships,
        effectiveRiders,
        hasAssignedBoards: await getHasAssignedBoards(effectiveRiders),
      } satisfies GuardianContext;
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
      const effectiveRiders = [rider];
      return {
        isGuardian: false,
        isDependent: true,
        rider,
        permissions: guardianRelationship.relationships[0].permissions,
        effectiveRiders,
        hasAssignedBoards: await getHasAssignedBoards(effectiveRiders),
      } satisfies DependentContext;
    }

    // Plain rider
    const effectiveRiders = [rider];
    return {
      isGuardian: false,
      isDependent: false,
      rider,
      effectiveRiders,
      hasAssignedBoards: await getHasAssignedBoards(effectiveRiders),
    } satisfies RiderContext;
  },
});

function RouteComponent() {
  const { hasAssignedBoards, effectiveRiders } = Route.useRouteContext();
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
      {!hasAssignedBoards && effectiveRiders.length > 0 ? (
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
