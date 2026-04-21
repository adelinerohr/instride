import { enrollmentOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  setHours,
  startOfWeek,
} from "date-fns";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ClipboardIcon,
  PlusIcon,
} from "lucide-react";

import { CalendarView } from "@/features/calendar/lib/types";
import { LessonCard } from "@/features/lessons/components/fragments/lesson-card";
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
import { ItemGroup } from "@/shared/components/ui/item";
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
  const { member, isGuardian, dependents, isOnlyGuardian, user } =
    Route.useRouteContext();
  const { slug } = Route.useParams();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const {
    data: { instanceEnrollments },
  } = useSuspenseQuery(enrollmentOptions.myEnrollments());

  const showDependentAlert = isGuardian && dependents?.length === 0;

  const renderGreeting = () => {
    if (!isGuardian) {
      return "Here's what's on the schedule for you.";
    } else {
      const dependentNames = dependents?.map(({ dependent }) => dependent.name);

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

  const lessonsThisWeek = instanceEnrollments?.filter((enrollment) => {
    return (
      enrollment.instance &&
      isWithinInterval(enrollment.instance.start, {
        start: weekStart,
        end: weekEnd,
      })
    );
  });

  const lessonsToday = instanceEnrollments?.filter((enrollment) => {
    return enrollment.instance && isSameDay(enrollment.instance.start, now);
  });

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
          {lessonsToday.length === 0 ? (
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
            <LessonCard variant="detail" lessonEnrollment={lessonsToday[0]} />
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex font-display text-xl font-semibold items-center gap-2">
              Lessons This Week
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {format(weekStart, "MMMM d")} - {format(weekEnd, endFormat)}{" "}
              &middot; {lessonsThisWeek.length} lesson
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
                      <LessonCard
                        key={enrollment.id}
                        variant="date-chip"
                        lessonEnrollment={enrollment}
                      />
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
