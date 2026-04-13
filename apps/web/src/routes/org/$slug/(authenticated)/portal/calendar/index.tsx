import {
  boardAssignmentsOptions,
  boardsOptions,
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
    const memberId = context.member.id;
    const { from, to } = getCalendarRange(deps.search.view, deps.search.date);

    context.queryClient.ensureQueryData(instanceOptions.inRange(from, to));
    context.queryClient.ensureQueryData(timeBlockOptions.inRange(from, to));
    context.queryClient.ensureQueryData(
      membersOptions.trainers({ boardId: deps.search.boardId })
    );
    context.queryClient.ensureQueryData(
      boardsOptions.list({ memberId, isTrainer: false })
    );

    return {
      from,
      to,
    };
  },
});

function RouteComponent() {
  const { from, to } = Route.useLoaderData();
  const { member } = Route.useRouteContext();
  const search = Route.useSearch();

  const { data: trainers, isLoading: isLoadingTrainers } = useSuspenseQuery(
    membersOptions.trainers({ boardId: search.boardId })
  );
  const { data: boards, isLoading: isLoadingBoards } = useSuspenseQuery(
    boardsOptions.list({ memberId: member.id, isTrainer: false })
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
      isPortal={true}
      isLoading={isLoading}
    >
      <Calendar />
    </CalendarProvider>
  );
}
