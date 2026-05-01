import {
  boardsOptions,
  eventOptions,
  instanceOptions,
  membersOptions,
  timeBlockOptions,
} from "@instride/api";
import {
  useQuery,
  keepPreviousData,
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
import { AdminCreateLessonModal } from "@/features/lessons/components/modals/quick-create/admin/modal";
import { ModalScope } from "@/shared/lib/stores/modal.store";

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
      context.queryClient.ensureQueryData(boardsOptions.list()),
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
  const { date, view } = Route.useSearch();

  const { from, to } = getVisibleRange(view, new Date(date));

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

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
      trainers={trainers}
      boards={boards}
      lessons={lessons}
      timeBlocks={timeBlocks}
      events={events}
      type="admin"
    >
      <ModalScope modals={[AdminCreateLessonModal]}>
        <Calendar />
      </ModalScope>
    </CalendarProvider>
  );
}
