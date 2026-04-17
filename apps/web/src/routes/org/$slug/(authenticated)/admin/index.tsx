import { instanceOptions, membersOptions, type types } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { endOfDay, endOfWeek, format, startOfDay, startOfWeek } from "date-fns";
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  ClipboardIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { AgendaLessonCard } from "@/features/calendar/components/views/agenda/lesson-card";
import { CalendarView } from "@/features/calendar/lib/types";
import { Page, PageBody, PageHeader } from "@/shared/components/layout/page";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/org/$slug/(authenticated)/admin/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membersOptions.riderStats());
    await context.queryClient.ensureQueryData(instanceOptions.stats());
    await context.queryClient.ensureQueryData(
      instanceOptions.inRange(startOfDay(new Date()), endOfDay(new Date()))
    );
    await context.queryClient.ensureQueryData(
      instanceOptions.inRange(
        startOfWeek(new Date(), { weekStartsOn: 0 }),
        endOfWeek(new Date(), { weekStartsOn: 0 })
      )
    );
  },
});

function RouteComponent() {
  const { member } = Route.useRouteContext();
  const { slug } = Route.useParams();

  const { data: riderStats } = useSuspenseQuery(membersOptions.riderStats());
  const { data: lessonStats } = useSuspenseQuery(instanceOptions.stats());
  const { data: lessonsThisWeek } = useSuspenseQuery(
    instanceOptions.inRange(
      startOfWeek(new Date(), { weekStartsOn: 0 }),
      endOfWeek(new Date(), { weekStartsOn: 0 })
    )
  );
  const { data: lessonsToday } = useSuspenseQuery(
    instanceOptions.inRange(startOfDay(new Date()), endOfDay(new Date()))
  );

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 }); // Saturday

  const hasPin = member.kioskPin !== null;

  return (
    <Page className="min-h-0 flex-1">
      <PageHeader title="Dashboard" backButton={false} />
      <PageBody className="space-y-4">
        {!hasPin && (
          <Alert className="w-full border-destructive bg-destructive/10 text-destructive">
            <AlertTriangleIcon />
            <AlertTitle>No Kiosk PIN set</AlertTitle>
            <AlertDescription>
              You don't have a Kiosk PIN set. Please set a PIN to use the Kiosk.
            </AlertDescription>
            <AlertAction>
              <Link
                to="/org/$slug/settings/account/profile"
                params={{ slug }}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "bg-transparent border-destructive hover:bg-destructive/20"
                )}
              >
                Set PIN
                <ChevronRightIcon />
              </Link>
            </AlertAction>
          </Alert>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* riders */}
          <StatsCard
            title="Total Riders"
            value={riderStats.totalRiders}
            percentageChange={riderStats.percentageChange}
            newThisMonth={riderStats.newRidersThisMonth}
            icon={UsersIcon}
          />

          {/* lessons */}
          <StatsCard
            title="Total Lessons"
            value={lessonStats.totalLessonInstancesThisMonth}
            percentageChange={lessonStats.percentageChange}
            newThisMonth={lessonStats.totalLessonInstancesThisMonth}
            icon={ClipboardIcon}
          />
        </div>

        {/* Upcoming Lessons */}
        <LessonSection
          instances={lessonsToday}
          title="Lessons Today"
          description={format(new Date(), "EEEE, MMMM d")}
          emptyTitle="No lessons scheduled today"
          emptyDescription="You don't have any lessons scheduled for today."
          emptyIcon={ClipboardIcon}
        />

        {/* Lessons This Week */}
        <LessonSection
          instances={lessonsThisWeek}
          title="Lessons This Week"
          description={`${format(weekStart, "MMMM d")} - ${format(weekEnd, "MMMM d, yyyy")}`}
          emptyTitle="No lessons scheduled this week"
          emptyDescription="You don't have any lessons scheduled for this week."
          emptyIcon={ClipboardIcon}
        />
      </PageBody>
    </Page>
  );
}

interface LessonSectionProps {
  instances: types.LessonInstance[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: LucideIcon;
}

function LessonSection({
  instances,
  title,
  description,
  emptyTitle,
  emptyDescription,
  emptyIcon: EmptyIcon,
}: LessonSectionProps) {
  const { slug } = Route.useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Link
            to="/org/$slug/admin/calendar"
            params={{
              slug,
            }}
            search={{
              view: CalendarView.AGENDA,
            }}
            className={buttonVariants({ variant: "default" })}
          >
            View All
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {instances.length === 0 ? (
          <Empty className="border border-dashed w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <EmptyIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="w-full">
            <div className="space-y-2">
              {instances.map((instance) => (
                <AgendaLessonCard key={instance.id} lesson={instance} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  percentageChange: number;
  newThisMonth: number;
  icon: LucideIcon;
}

function StatsCard({
  title,
  value,
  percentageChange,
  newThisMonth,
  icon: Icon,
}: StatsCardProps) {
  const isPositiveChange = percentageChange >= 0;
  const changeColor = isPositiveChange ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <div className="flex flex-col gap-2">
          <h4 className="font-display text-2xl lg:text-3xl">{value}</h4>
          <div className="text-muted-foreground text-sm flex items-center gap-1">
            <span className={changeColor}>
              {isPositiveChange ? "+" : ""}
              {percentageChange}%
            </span>
            <span>from last month</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {newThisMonth} new this month
          </div>
        </div>
        <CardAction>
          <div className="flex gap-4">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full border">
              <Icon className="size-5" />
            </div>
          </div>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
