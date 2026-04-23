import { instanceOptions, type types } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { endOfDay, endOfWeek, format, startOfDay, startOfWeek } from "date-fns";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarPlusIcon,
  ChevronRightIcon,
  ClipboardIcon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";
import z from "zod";

import {
  LessonCard,
  LessonCardVariant,
} from "@/features/lessons/components/fragments/lesson-card";
import { DateChip } from "@/features/lessons/components/fragments/lesson-card/date-chip";
import { lessonModalHandler } from "@/features/lessons/components/modals/new-lesson";
import {
  findNearestLesson,
  getPhaseOfDay,
  groupByDay,
} from "@/features/lessons/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/org/$slug/(authenticated)/admin/")({
  component: RouteComponent,
  validateSearch: z.object({
    view: z.enum(["admin", "trainer"]).optional(),
  }),
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(
      instanceOptions.inRange(startOfDay(new Date()), endOfDay(new Date()))
    );
    context.queryClient.prefetchQuery(
      instanceOptions.inRange(
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        endOfWeek(new Date(), { weekStartsOn: 1 })
      )
    );
  },
});

function RouteComponent() {
  const { member, user, trainerId } = Route.useRouteContext();
  const { slug } = Route.useParams();
  const { view } = Route.useSearch();
  const navigate = Route.useNavigate();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const { data: lessonsToday } = useSuspenseQuery(
    instanceOptions.inRange(startOfDay(now), endOfDay(now))
  );
  const { data: lessonsThisWeek } = useSuspenseQuery(
    instanceOptions.inRange(weekStart, weekEnd)
  );

  // View resolution: if user has both roles, allow switching. Default to trainer.
  const isAdmin = member.roles.includes("admin");
  const isTrainer = trainerId !== null;
  const canSwitchViews = isAdmin && isTrainer;
  const activeView = canSwitchViews
    ? (view ?? "trainer")
    : isAdmin
      ? "admin"
      : "trainer";

  const filterForView = React.useCallback(
    (lessons: types.LessonInstance[]) =>
      activeView === "trainer" && trainerId
        ? lessons.filter((lesson) => lesson.trainerId === trainerId)
        : lessons,
    [activeView, trainerId]
  );

  const todayLessons = React.useMemo(
    () => filterForView(lessonsToday),
    [filterForView, lessonsToday]
  );
  const weekLessons = React.useMemo(
    () => filterForView(lessonsThisWeek),
    [filterForView, lessonsThisWeek]
  );

  const nearestLesson = React.useMemo(
    () => findNearestLesson(todayLessons, now),
    [todayLessons, now]
  );
  const lessonsByDay = React.useMemo(
    () => groupByDay(weekLessons),
    [weekLessons]
  );

  const hasPin = member.kioskPin !== null;
  const phaseOfDay = getPhaseOfDay(now);

  return (
    <Page className="min-h-0 flex-1">
      <PageHeader title="Dashboard" backButton={false}>
        {canSwitchViews && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Viewing as</span>
            <Select
              value={activeView}
              onValueChange={(value) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    view: value as "admin" | "trainer" | undefined,
                  }),
                  replace: true,
                })
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button />}>
            <PlusIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit">
            <DropdownMenuItem
              onClick={() =>
                lessonModalHandler.openWithPayload({
                  trainerId: trainerId ?? undefined,
                })
              }
            >
              <CalendarPlusIcon />
              Create Lesson
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <PageBody className="space-y-8">
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

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold font-display">
            Good {phaseOfDay}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's what's on the schedule for you.
          </p>
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

          {todayLessons.length === 0 ? (
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
              {nearestLesson && (
                <LessonCard
                  variant={LessonCardVariant.DETAIL}
                  lesson={nearestLesson}
                />
              )}
              {todayLessons.length > 1 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-semibold font-display uppercase text-muted-foreground">
                    Also today
                  </h2>
                  {todayLessons
                    .filter((l) => l.id !== nearestLesson?.id)
                    .map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        variant={LessonCardVariant.DATE_CHIP}
                        lesson={lesson}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold">Upcoming this week</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {format(weekStart, "MMMM d")} – {format(weekEnd, "MMMM d")} ·{" "}
              {weekLessons.length} lessons
            </CardDescription>
            <CardAction>
              <Link
                to="/org/$slug/portal/calendar"
                params={{ slug }}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View all
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessonsByDay.map(({ day, lessons }) => (
              <div key={day.toISOString()} className="grid grid-cols-10 gap-4">
                {/* Date chip as section header, col-span-1 */}
                <div className="col-span-1 flex items-start justify-center">
                  <DateChip day={day} />
                </div>
                {/* Lessons stacked, col-span-9 */}
                <div className="col-span-9 flex flex-col gap-4">
                  {lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      variant={LessonCardVariant.DATE_CHIP}
                      lesson={lesson}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  );
}
