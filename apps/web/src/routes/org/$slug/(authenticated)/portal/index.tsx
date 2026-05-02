import { enrollmentOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  endOfDay,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  setHours,
  startOfDay,
  startOfWeek,
} from "date-fns";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ClipboardIcon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";

import { CalendarView } from "@/features/calendar/lib/types";
import {
  LessonCard,
  LessonCardVariant,
} from "@/features/lessons/components/fragments/lesson-card";
import { DateChip } from "@/features/lessons/components/fragments/lesson-card/date-chip";
import {
  findNearestEnrollment,
  groupEnrollmentsByDay,
} from "@/features/lessons/lib/utils";
import { Page, PageBody, PageHeader } from "@/shared/components/layout/page";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Empty,
  EmptyTitle,
  EmptyMedia,
  EmptyHeader,
  EmptyDescription,
} from "@/shared/components/ui/empty";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/org/$slug/(authenticated)/portal/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const now = startOfDay(new Date());
    context.queryClient.prefetchQuery(
      enrollmentOptions.myEnrollments(
        startOfDay(now).toISOString(),
        endOfDay(now).toISOString()
      )
    );
    context.queryClient.prefetchQuery(
      enrollmentOptions.myEnrollments(
        startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        endOfWeek(now, { weekStartsOn: 1 }).toISOString()
      )
    );
  },
});

function RouteComponent() {
  const { member, isGuardian, dependents, isOnlyGuardian, user } =
    Route.useRouteContext();
  const { slug } = Route.useParams();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const { data: enrollmentsToday } = useSuspenseQuery(
    enrollmentOptions.myEnrollments(
      startOfDay(now).toISOString(),
      endOfDay(now).toISOString()
    )
  );
  const { data: enrollmentsThisWeek } = useSuspenseQuery(
    enrollmentOptions.myEnrollments(
      startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      endOfWeek(now, { weekStartsOn: 1 }).toISOString()
    )
  );

  console.log({
    todayQuery: {
      start: startOfDay(now).toISOString(),
      end: endOfDay(now).toISOString(),
    },
    weekQuery: {
      start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    },
    enrollmentsToday: enrollmentsToday.map((e) => ({
      id: e.id,
      startTime: e.instance?.start,
      parsedLocal: e.instance?.start
        ? format(new Date(e.instance.start), "yyyy-MM-dd HH:mm zzz")
        : null,
    })),
    enrollmentsThisWeek: enrollmentsThisWeek.map((e) => ({
      id: e.id,
      startTime: e.instance?.start,
      parsedLocal: e.instance?.start
        ? format(new Date(e.instance.start), "yyyy-MM-dd HH:mm zzz")
        : null,
    })),
  });

  const guardianHasNoDependents = isGuardian && dependents?.length === 0;

  const renderGreeting = () => {
    if (!isGuardian) {
      return "Here's what's on the schedule for you.";
    } else {
      const dependentNames = dependents?.map(
        (dependent) => dependent.rider.member.authUser.name
      );

      if (!dependentNames) {
        return "Here's what's on the schedule for you.";
      }

      const dependentNamesString =
        dependentNames.length === 1
          ? dependentNames[0]
          : dependentNames.slice(0, -1).join(", ") +
            " and " +
            dependentNames[dependentNames.length - 1];

      if (isOnlyGuardian) {
        return `Here's what's on the schedule for ${dependentNamesString}.`;
      } else {
        return `Here's what's on the schedule for you and ${dependentNamesString}.`;
      }
    }
  };

  const nearestEnrollment = React.useMemo(
    () => findNearestEnrollment(enrollmentsToday, now),
    [enrollmentsToday, now]
  );

  const enrollmentsByDay = React.useMemo(
    () => groupEnrollmentsByDay(enrollmentsThisWeek),
    [enrollmentsThisWeek]
  );

  const hasPin = member.kioskPin !== null;

  const phaseOfDay = isBefore(now, setHours(now, 12))
    ? "morning"
    : isBefore(now, setHours(now, 18))
      ? "afternoon"
      : "evening";
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
      {guardianHasNoDependents && (
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
          guardianHasNoDependents && "opacity-50 pointer-events-none"
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
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold font-display">
            Good {phaseOfDay}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">{renderGreeting()}</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold font-display">Today</h2>
            <Badge variant="accent">{format(now, "EEEE, MMMM d")}</Badge>
            <Link
              to="/org/$slug/portal/calendar"
              params={{ slug }}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "ml-auto"
              )}
            >
              Open calendar
              <ArrowRightIcon />
            </Link>
          </div>
          {enrollmentsToday.length === 0 ? (
            <Empty className="border border-dashed w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardIcon className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No lessons today</EmptyTitle>
                <EmptyDescription>
                  You don't have any lessons scheduled for today.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {nearestEnrollment ? (
                <LessonCard
                  variant={LessonCardVariant.DETAIL}
                  lesson={nearestEnrollment.instance!}
                  rider={nearestEnrollment.rider ?? undefined}
                />
              ) : (
                <Empty className="border border-dashed w-full">
                  <EmptyHeader>
                    <EmptyTitle>All lessons have passed</EmptyTitle>
                    <EmptyDescription>
                      All of your lessons for today have already passed.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {enrollmentsToday.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-medium font-display uppercase text-muted-foreground text-xs">
                    Also today
                  </h2>
                  {enrollmentsToday
                    .filter(
                      (enrollment) => enrollment.id !== nearestEnrollment?.id
                    )
                    .map((enrollment) => {
                      const isPassed = isBefore(
                        new Date(enrollment.instance?.start),
                        now
                      );
                      return (
                        <div
                          className={cn(
                            "bg-card rounded-lg p-2 border",
                            isPassed && "opacity-50"
                          )}
                          key={enrollment.id}
                        >
                          <LessonCard
                            variant={LessonCardVariant.DATE_CHIP}
                            lesson={enrollment.instance!}
                            rider={enrollment.rider ?? undefined}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex font-display text-xl font-semibold items-center gap-2">
              Lessons This Week
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {format(weekStart, "MMMM d")} - {format(weekEnd, endFormat)}{" "}
              &middot; {enrollmentsThisWeek.length} lesson
            </CardDescription>
            <CardAction>
              <Link
                to="/org/$slug/portal/calendar"
                params={{ slug }}
                search={{
                  view: CalendarView.AGENDA,
                }}
                className={buttonVariants({ variant: "outline" })}
              >
                View All
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollmentsByDay.length === 0 ? (
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
              enrollmentsByDay.map(({ day, enrollments }) => (
                <div
                  key={day.toISOString()}
                  className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-6"
                >
                  {/* Date chip as section header, col-span-1 */}
                  <div className="col-span-1 hidden sm:flex items-start justify-center">
                    <DateChip day={day} />
                  </div>
                  <span className="block sm:hidden text-lg font-medium font-display">
                    {format(day, "EEEE")}
                  </span>
                  {/* Lessons stacked, col-span-9 */}
                  <div className="hidden sm:col-span-11 sm:flex flex-col gap-4 w-full justify-center">
                    {enrollments.map((enrollment) => (
                      <LessonCard
                        key={enrollment.id}
                        variant={LessonCardVariant.DATE_CHIP}
                        lesson={enrollment.instance!}
                        rider={enrollment.rider ?? undefined}
                      />
                    ))}
                  </div>
                  <div className="sm:hidden flex flex-col gap-4 w-full">
                    {enrollments.map((enrollment) => (
                      <LessonCard
                        key={enrollment.id}
                        variant={LessonCardVariant.AGENDA}
                        lesson={enrollment.instance!}
                        rider={enrollment.rider ?? undefined}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  );
}
