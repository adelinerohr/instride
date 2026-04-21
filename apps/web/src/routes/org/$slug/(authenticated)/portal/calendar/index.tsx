import {
  boardAssignmentsOptions,
  boardsOptions,
  eventOptions,
  instanceOptions,
  membersOptions,
  timeBlockOptions,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  addDays,
  addMonths,
  subDays,
  subMonths,
  subWeeks,
  addWeeks,
  endOfMonth,
  startOfMonth,
} from "date-fns";

import { Calendar } from "@/features/calendar/components";
import { CalendarProvider } from "@/features/calendar/hooks/use-calendar";
import { calendarSearchSchema } from "@/features/calendar/lib/search-params";
import { CalendarView } from "@/features/calendar/lib/types";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/portal/calendar/"
)({
  component: RouteComponent,
  validateSearch: calendarSearchSchema,
  beforeLoad: async ({ context, search }) => {
    if (search.boardId.trim() !== "") return;

    if (context.effectiveRiderIds.length === 0) return;

    // Find the first board across any of the effective riders
    const assignments = await Promise.all(
      context.effectiveRiderIds.map(async (riderId) =>
        context.queryClient.ensureQueryData(
          boardAssignmentsOptions.byRider(riderId)
        )
      )
    );

    const defaultAssignment = assignments
      .flatMap((assignment) => assignment)
      .at(0);

    if (defaultAssignment) {
      throw Route.redirect({
        to: ".",
        search: (prev) => ({ ...prev, boardId: defaultAssignment.boardId }),
        replace: true,
      });
    }
  },
  loaderDeps: ({ search }) => ({
    // Only refetch when moving to a different month
    month: startOfMonth(search.date).toISOString(),
    view: search.view,
    boardId: search.boardId,
  }),
  loader: async ({ context, deps }) => {
    const monthStart = new Date(deps.month);

    // Fetch the entire month
    const from = startOfMonth(monthStart);
    const to = endOfMonth(monthStart);

    await Promise.all([
      context.queryClient.ensureQueryData(instanceOptions.inRange(from, to)),
      context.queryClient.ensureQueryData(timeBlockOptions.inRange(from, to)),
      context.queryClient.ensureQueryData(
        membersOptions.trainers({ boardId: deps.boardId })
      ),
      context.queryClient.ensureQueryData(
        boardsOptions.list({ riderIds: context.effectiveRiderIds })
      ),
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
  const { effectiveRiderIds } = Route.useRouteContext();
  const { date, view, boardId } = Route.useSearch();

  const { data: trainers } = useSuspenseQuery(
    membersOptions.trainers({ boardId })
  );
  const { data: boards } = useSuspenseQuery(
    boardsOptions.list({ riderIds: effectiveRiderIds })
  );
  const { data: allLessons } = useSuspenseQuery(
    instanceOptions.inRange(from, to)
  );
  const { data: allTimeBlocks } = useSuspenseQuery(
    timeBlockOptions.inRange(from, to)
  );
  const { data: allEvents } = useSuspenseQuery(
    eventOptions.list({ from: from.toISOString(), to: to.toISOString() })
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

  // Filter to visible range
  const lessons = allLessons.filter((lesson) => {
    const lessonDate = new Date(lesson.start);
    return lessonDate >= visibleFrom && lessonDate <= visibleTo;
  });

  const timeBlocks = allTimeBlocks.filter((block) => {
    const blockStart = new Date(block.start);
    const blockEnd = new Date(block.end);
    return blockStart >= visibleFrom && blockEnd <= visibleTo;
  });

  console.log(lessons);

  return (
    <CalendarProvider
      events={allEvents}
      trainers={trainers}
      boards={boards}
      lessons={lessons}
      timeBlocks={timeBlocks}
      type="portal"
    >
      <Calendar />
    </CalendarProvider>
  );
}
