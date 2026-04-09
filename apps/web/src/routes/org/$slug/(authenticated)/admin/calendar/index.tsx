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

import { CalendarPage } from "@/features/calendar/components/calendar";
import { useAgendaView } from "@/features/calendar/hooks/use-agenda-view";
import { useDayView } from "@/features/calendar/hooks/use-day-view";
import { useFilteredData } from "@/features/calendar/hooks/use-filtered-data";
import { useWeekView } from "@/features/calendar/hooks/use-week-view";
import { calendarSearchSchema } from "@/features/calendar/lib/search-params";
import { CalendarView } from "@/features/calendar/lib/types";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/calendar/"
)({
  component: RouteComponent,
  validateSearch: calendarSearchSchema,
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
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const { data: lessons, isLoading: isLoadingLessons } = useSuspenseQuery(
    instanceOptions.inRange(from, to)
  );
  const { data: timeBlocks, isLoading: isLoadingTimeBlocks } = useSuspenseQuery(
    timeBlockOptions.inRange(from, to)
  );
  const { data: trainers, isLoading: isLoadingTrainers } = useSuspenseQuery(
    membersOptions.trainers()
  );
  const { data: boards, isLoading: isLoadingBoards } = useSuspenseQuery(
    boardsOptions.list()
  );
  const { data: services, isLoading: isLoadingServices } = useSuspenseQuery(
    servicesOptions.all()
  );

  const isLoading =
    isLoadingLessons ||
    isLoadingTimeBlocks ||
    isLoadingTrainers ||
    isLoadingBoards ||
    isLoadingServices;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading calendar…
      </div>
    );
  }

  const filtered = useFilteredData({
    lessons,
    timeBlocks,
    selectedTrainerIds: search.trainerIds,
    selectedBoardId: search.boardId,
  });

  const weekModel = useWeekView({
    date: new Date(search.date),
    lessons: filtered.lessons,
    timeBlocks: filtered.timeBlocks,
  });

  const dayModel = useDayView({
    date: new Date(search.date),
    lessons: filtered.lessons,
    timeBlocks: filtered.timeBlocks,
    trainers,
    selectedTrainerIds: search.trainerIds,
  });

  const agendaModel = useAgendaView({
    date: new Date(search.date),
    lessons: filtered.lessons,
    timeBlocks: filtered.timeBlocks,
    hideEmptyDays: true,
  });

  const trainersById = Object.fromEntries(
    trainers.map((trainer) => [trainer.id, trainer] as const)
  );

  return (
    <div className="flex h-full flex-col">
      <CalendarPage
        view={search.view}
        headerProps={{
          slug,
          date: new Date(search.date),
          view: search.view,
          boards,
          trainers,
          selectedTrainerIds: search.trainerIds ?? [],
          selectedBoardId: search.boardId,
        }}
        weekViewProps={{
          ...weekModel,
          trainersById,
        }}
        dayViewProps={{
          ...dayModel,
          date: new Date(search.date),
        }}
        agendaViewProps={{
          ...agendaModel,
          trainersById,
        }}
      />
    </div>
  );
}
