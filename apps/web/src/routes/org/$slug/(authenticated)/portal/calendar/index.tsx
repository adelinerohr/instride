import {
  boardAssignmentsOptions,
  boardsOptions,
  eventOptions,
  instanceOptions,
  membersOptions,
  timeBlockOptions,
} from "@instride/api";
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Calendar } from "@/features/calendar/components";
import { CalendarProvider } from "@/features/calendar/hooks/use-calendar";
import {
  getAdjacentRanges,
  getVisibleRange,
} from "@/features/calendar/lib/range";
import { calendarSearchSchema } from "@/features/calendar/lib/search-params";
import { RiderCreateLessonModal } from "@/features/lessons/components/modals/quick-create/rider/modal";
import { ModalScope } from "@/shared/lib/stores/modal.store";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/portal/calendar/"
)({
  component: RouteComponent,
  validateSearch: calendarSearchSchema,
  beforeLoad: async ({ context, search }) => {
    if (search.boardId.trim() !== "") return;
    if (context.effectiveRiders.length === 0) return;

    const assignments = await Promise.all(
      context.effectiveRiders.map((rider) =>
        context.queryClient.ensureQueryData(
          boardAssignmentsOptions.byRider(rider.id)
        )
      )
    );

    const defaultAssignment = assignments.flat().at(0);

    if (defaultAssignment) {
      throw Route.redirect({
        to: ".",
        search: (prev) => ({ ...prev, boardId: defaultAssignment.boardId }),
        replace: true,
      });
    }
  },
  loaderDeps: ({ search }) => ({
    view: search.view,
    date: search.date,
  }),
  loader: async ({ context, deps }) => {
    const date = new Date(deps.date);
    const { from, to } = getVisibleRange(deps.view, date);

    await Promise.all([
      context.queryClient.ensureQueryData(instanceOptions.inRange(from, to)),
      context.queryClient.ensureQueryData(timeBlockOptions.inRange(from, to)),
      context.queryClient.ensureQueryData(membersOptions.trainers()),
      context.queryClient.ensureQueryData(
        boardsOptions.list({
          riderIds: context.effectiveRiders.map((rider) => rider.id),
        })
      ),
      context.queryClient.ensureQueryData(
        eventOptions.list({ from: from.toISOString(), to: to.toISOString() })
      ),
    ]);

    // Prefetch adjacent ranges
    const { prev, next } = getAdjacentRanges(deps.view, date);

    for (const range of [prev, next]) {
      const fromIso = range.from.toISOString();
      const toIso = range.to.toISOString();
      context.queryClient.prefetchQuery(
        instanceOptions.inRange(range.from, range.to)
      );
      context.queryClient.prefetchQuery(
        timeBlockOptions.inRange(range.from, range.to)
      );
      context.queryClient.prefetchQuery(
        eventOptions.list({ from: fromIso, to: toIso })
      );
    }
  },
});

function RouteComponent() {
  const { effectiveRiders } = Route.useRouteContext();
  const { date, view } = Route.useSearch();

  const { from, to } = getVisibleRange(view, new Date(date));

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: boards } = useSuspenseQuery(
    boardsOptions.list({ riderIds: effectiveRiders.map((rider) => rider.id) })
  );

  // Range-scoped queries: keep previous data in cache
  const { data: lessons = [] } = useQuery({
    ...instanceOptions.inRange(from, to),
    placeholderData: keepPreviousData,
  });
  const { data: timeBlocks = [] } = useQuery({
    ...timeBlockOptions.inRange(from, to),
    placeholderData: keepPreviousData,
  });
  const { data: events = [] } = useQuery({
    ...eventOptions.list({ from: from.toISOString(), to: to.toISOString() }),
    placeholderData: keepPreviousData,
  });

  return (
    <CalendarProvider
      events={events}
      trainers={trainers}
      boards={boards}
      lessons={lessons}
      timeBlocks={timeBlocks}
      type="portal"
    >
      <ModalScope modals={[RiderCreateLessonModal]}>
        <Calendar />
      </ModalScope>
    </CalendarProvider>
  );
}
