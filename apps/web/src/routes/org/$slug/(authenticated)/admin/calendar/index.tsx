import {
  boardsOptions,
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
  subDays,
  subMonths,
  subWeeks,
  addWeeks,
} from "date-fns";

import { Calendar } from "@/features/calendar/components";
import { CalendarProvider } from "@/features/calendar/hooks/use-calendar";
import { calendarSearchSchema } from "@/features/calendar/lib/search-params";
import { CalendarView } from "@/features/calendar/lib/types";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/calendar/"
)({
  component: RouteComponent,
  validateSearch: calendarSearchSchema,
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
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps }) => {
    const from =
      deps.search.view === CalendarView.DAY
        ? subDays(deps.search.date, 1)
        : deps.search.view === CalendarView.AGENDA
          ? subMonths(deps.search.date, 1)
          : subWeeks(deps.search.date, 1);

    const to =
      deps.search.view === CalendarView.DAY
        ? addDays(deps.search.date, 1)
        : deps.search.view === CalendarView.AGENDA
          ? addMonths(deps.search.date, 1)
          : addWeeks(deps.search.date, 1);

    context.queryClient.ensureQueryData(instanceOptions.inRange(from, to));
    context.queryClient.ensureQueryData(timeBlockOptions.inRange(from, to));
    context.queryClient.ensureQueryData(membersOptions.trainers());
    context.queryClient.ensureQueryData(boardsOptions.list());
    context.queryClient.ensureQueryData(servicesOptions.all());

    return {
      from,
      to,
    };
  },
});

function RouteComponent() {
  const { from, to } = Route.useLoaderData();

  const { data: trainers, isLoading: isLoadingTrainers } = useSuspenseQuery(
    membersOptions.trainers()
  );
  const { data: boards, isLoading: isLoadingBoards } = useSuspenseQuery(
    boardsOptions.list()
  );
  const { data: lessons, isLoading: isLoadingLessons } = useSuspenseQuery(
    instanceOptions.inRange(from, to)
  );
  const { data: timeBlocks, isLoading: isLoadingTimeBlocks } = useSuspenseQuery(
    timeBlockOptions.inRange(from, to)
  );

  const isLoading =
    isLoadingTrainers ||
    isLoadingBoards ||
    isLoadingLessons ||
    isLoadingTimeBlocks;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CalendarProvider
      trainers={trainers}
      boards={boards}
      lessons={lessons}
      timeBlocks={timeBlocks}
      isPortal={false}
      isLoading={isLoading}
    >
      <Calendar />
    </CalendarProvider>
  );
}
