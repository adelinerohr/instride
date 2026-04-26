import {
  boardsOptions,
  eventOptions,
  instanceOptions,
  membersOptions,
  servicesOptions,
  timeBlockOptions,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { z } from "zod";

import { Calendar } from "@/features/calendar/components";
import { CalendarProvider } from "@/features/calendar/hooks/use-calendar";
import { calendarSearchSchema } from "@/features/calendar/lib/search-params";
import { CalendarView } from "@/features/calendar/lib/types";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/kiosk/$sessionId/calendar"
)({
  component: RouteComponent,
  validateSearch: calendarSearchSchema.extend({
    onlyMine: z.boolean().optional().default(false),
  }),
  beforeLoad: async ({ context, search }) => {
    if (search.boardId.trim() !== "") return;

    const boards = await context.queryClient.ensureQueryData(
      boardsOptions.list()
    );
    const defaultBoard = boards[0];

    if (defaultBoard) {
      throw Route.redirect({
        to: ".",
        search: (prev) => ({ ...prev, boardId: defaultBoard.id }),
        replace: true,
      });
    }
  },
  loaderDeps: ({ search }) => ({
    // Only refetch when moving to a different month
    month: startOfMonth(search.date).toISOString(),
    view: search.view,
  }),
  loader: async ({ context, deps, params }) => {
    const monthStart = new Date(deps.month);

    // Fetch the entire month
    const from = startOfMonth(monthStart);
    const to = endOfMonth(monthStart);

    await Promise.all([
      context.queryClient.ensureQueryData(instanceOptions.inRange(from, to)),
      context.queryClient.ensureQueryData(timeBlockOptions.inRange(from, to)),
      context.queryClient.ensureQueryData(membersOptions.trainers()),
      context.queryClient.ensureQueryData(boardsOptions.list()),
      context.queryClient.ensureQueryData(servicesOptions.all()),
      context.queryClient.ensureQueryData(
        eventOptions.list({ from: from.toISOString(), to: to.toISOString() })
      ),
    ]);

    return {
      from,
      to,
    };
  },
});

function RouteComponent() {
  const { from, to } = Route.useLoaderData();
  const { kioskSession } = Route.useRouteContext();
  const { date, view } = Route.useSearch();

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const { data: allLessons } = useSuspenseQuery(
    instanceOptions.inRange(from, to)
  );
  const { data: allTimeBlocks } = useSuspenseQuery(
    timeBlockOptions.inRange(from, to)
  );
  const { data: allEvents } = useSuspenseQuery(
    eventOptions.list({
      from: from.toISOString(),
      to: to.toISOString(),
    })
  );

  // Calculate visible range based on current view
  const visibleFrom =
    view === CalendarView.DAY
      ? subDays(date, 1)
      : view === CalendarView.AGENDA
        ? subMonths(date, 1)
        : subWeeks(date, 1);

  const visibleTo =
    view === CalendarView.DAY
      ? addDays(date, 1)
      : view === CalendarView.AGENDA
        ? addMonths(date, 1)
        : addWeeks(date, 1);

  const lessons = allLessons.filter((lesson) => {
    if (kioskSession.boardId && lesson.boardId !== kioskSession.boardId)
      return false;
    const lessonDate = new Date(lesson.start);
    return lessonDate >= visibleFrom && lessonDate <= visibleTo;
  });

  const timeBlocks = allTimeBlocks.filter((block) => {
    if (kioskSession.boardId && block.boardId !== kioskSession.boardId)
      return false;
    const blockStart = new Date(block.start);
    const blockEnd = new Date(block.end);
    return blockStart >= visibleFrom && blockEnd <= visibleTo;
  });

  return (
    <CalendarProvider
      events={allEvents}
      trainers={trainers}
      boards={boards}
      lessons={lessons}
      timeBlocks={timeBlocks}
      type="kiosk"
    >
      <Calendar />
    </CalendarProvider>
  );
}
