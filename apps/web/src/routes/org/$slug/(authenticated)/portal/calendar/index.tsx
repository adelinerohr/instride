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

import { Calendar } from "@/features/calendar/components";
import { CalendarProvider } from "@/features/calendar/hooks/use-calendar";
import { calendarSearchSchema } from "@/features/calendar/lib/search-params";
import { getCalendarRange } from "@/features/calendar/utils/date";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/portal/calendar/"
)({
  component: RouteComponent,
  validateSearch: calendarSearchSchema,
  beforeLoad: async ({ context, search }) => {
    if (search.boardId.trim() !== "") return;

    const riderId = context.member.rider?.id;

    const assignments = await context.queryClient.ensureQueryData(
      boardAssignmentsOptions.byRider(riderId ?? "")
    );
    const defaultAssignment = assignments[0];

    if (defaultAssignment) {
      throw Route.redirect({
        to: ".",
        search: (prev) => ({ ...prev, boardId: defaultAssignment.boardId }),
        replace: true,
      });
    }
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps }) => {
    const { from, to } = getCalendarRange(deps.search.view, deps.search.date);

    context.queryClient.ensureQueryData(instanceOptions.inRange(from, to));
    context.queryClient.ensureQueryData(timeBlockOptions.inRange(from, to));
    context.queryClient.ensureQueryData(
      membersOptions.trainers({ boardId: deps.search.boardId })
    );
    context.queryClient.ensureQueryData(
      boardsOptions.list({ riderId: context.rider.id })
    );
    context.queryClient.ensureQueryData(
      eventOptions.list({ from: from.toISOString(), to: to.toISOString() })
    );

    return {
      from,
      to,
    };
  },
});

function RouteComponent() {
  const { from, to } = Route.useLoaderData();
  const { rider } = Route.useRouteContext();
  const search = Route.useSearch();

  const { data: trainers, isLoading: isLoadingTrainers } = useSuspenseQuery(
    membersOptions.trainers({ boardId: search.boardId })
  );
  const { data: boards, isLoading: isLoadingBoards } = useSuspenseQuery(
    boardsOptions.list({ riderId: rider.id })
  );
  const { data: lessons, isLoading: isLoadingLessons } = useSuspenseQuery(
    instanceOptions.inRange(from, to)
  );
  const { data: timeBlocks, isLoading: isLoadingTimeBlocks } = useSuspenseQuery(
    timeBlockOptions.inRange(from, to)
  );
  const { data: allEvents } = useSuspenseQuery(
    eventOptions.list({ from: from.toISOString(), to: to.toISOString() })
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
