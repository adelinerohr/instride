import { enrollmentOptions, getUser } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  startOfWeek,
} from "date-fns";
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  ClipboardIcon,
  PlusIcon,
} from "lucide-react";

import { CalendarView } from "@/features/calendar/lib/types";
import { viewLessonModalHandler } from "@/features/lessons/components/modals/view-lesson";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Page, PageBody, PageHeader } from "@/shared/components/layout/page";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  Empty,
  EmptyTitle,
  EmptyMedia,
  EmptyHeader,
  EmptyDescription,
} from "@/shared/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/org/$slug/(authenticated)/portal/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      enrollmentOptions.myEnrollments()
    );
  },
});

function RouteComponent() {
  const { member, isGuardian, dependents, isOnlyGuardian } =
    Route.useRouteContext();
  const { slug } = Route.useParams();

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const {
    data: { instanceEnrollments },
  } = useSuspenseQuery(enrollmentOptions.myEnrollments());

  const showDependentAlert = isGuardian && dependents?.length === 0;

  const lessonsThisWeek = instanceEnrollments?.filter((enrollment) => {
    return (
      enrollment.instance &&
      isWithinInterval(enrollment.instance.start, {
        start: weekStart,
        end: weekEnd,
      })
    );
  });

  const hasPin = member.kioskPin !== null;

  const endFormat = isSameMonth(weekStart, weekEnd)
    ? "d, yyyy"
    : "MMMM d, yyyy";

  return (
    <Page className="min-h-0 flex-1">
      <PageHeader title="Dashboard" backButton={false}>
        <Link
          to="/org/$slug/portal/lessons/create"
          params={{ slug }}
          className={buttonVariants({ variant: "default" })}
        >
          <PlusIcon />
          Create Lesson
        </Link>
      </PageHeader>
      {showDependentAlert && (
        <Alert variant="destructive" className="w-full">
          <AlertTriangleIcon />
          <AlertTitle>No dependents</AlertTitle>
          <AlertDescription>
            You don't have any dependents. Please add a dependent to use the
            portal.
          </AlertDescription>
          <AlertAction>
            <Link
              to="/org/$slug/settings/account/guardian"
              params={{ slug }}
              className={buttonVariants({ variant: "outline" })}
            >
              Manage Dependents
              <ChevronRightIcon />
            </Link>
          </AlertAction>
        </Alert>
      )}
      <PageBody
        className={cn(
          "space-y-4",
          isOnlyGuardian && "opacity-50 pointer-events-none"
        )}
      >
        {!hasPin && (
          <Alert variant="destructive" className="w-full">
            <AlertTriangleIcon />
            <AlertTitle>No Kiosk PIN set</AlertTitle>
            <AlertDescription>
              You don't have a Kiosk PIN set. Please set a PIN to use the Kiosk.
            </AlertDescription>
            <AlertAction>
              <Link
                to="/org/$slug/settings/account/profile"
                params={{ slug }}
                className={buttonVariants({ variant: "outline" })}
              >
                Set PIN
                <ChevronRightIcon />
              </Link>
            </AlertAction>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Lessons This Week</span>{" "}
              <Badge variant="secondary">
                {lessonsThisWeek.length} lesson
                {lessonsThisWeek.length === 1 ? "" : "s"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {format(weekStart, "MMMM d")} - {format(weekEnd, endFormat)}
            </CardDescription>
            <CardAction>
              <Link
                to="/org/$slug/portal/calendar"
                params={{ slug }}
                search={{
                  view: CalendarView.AGENDA,
                }}
                className={buttonVariants({ variant: "ghost" })}
              >
                View All
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {lessonsThisWeek.length === 0 ? (
              <Empty className="border border-dashed w-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClipboardIcon className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No lessons this week</EmptyTitle>
                  <EmptyDescription>
                    You don't have any lessons scheduled for this week.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ItemGroup>
                {lessonsThisWeek.map(
                  (enrollment) =>
                    enrollment.instance && (
                      <DialogTrigger
                        key={enrollment.id}
                        className="cursor-pointer"
                        handle={viewLessonModalHandler}
                        payload={{ lesson: enrollment.instance }}
                        nativeButton={false}
                        render={<Item variant="outline" />}
                      >
                        <ItemMedia>
                          <UserAvatar
                            size="lg"
                            user={getUser({
                              trainer: enrollment.instance.trainer!,
                            })}
                          />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>
                            {enrollment.instance.name ??
                              enrollment.instance.series?.name}
                          </ItemTitle>
                          <ItemDescription>
                            {format(
                              enrollment.instance.start,
                              "MMM d, yyyy h:mm a"
                            )}{" "}
                            - {format(enrollment.instance.end, "h:mm a")}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Button variant="ghost" size="icon">
                            <ChevronRightIcon />
                          </Button>
                        </ItemActions>
                      </DialogTrigger>
                    )
                )}
              </ItemGroup>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  );
}
