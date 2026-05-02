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
import React from "react";
import { z } from "zod";

import { Calendar } from "@/features/calendar/components";
import { CalendarProvider } from "@/features/calendar/hooks/use-calendar";
import {
  getAdjacentRanges,
  getVisibleRange,
} from "@/features/calendar/lib/range";
import { calendarSearchSchema } from "@/features/calendar/lib/search-params";
import { AdminCreateLessonModal } from "@/features/lessons/components/modals/quick-create/admin/modal";
import { RiderCreateLessonModal } from "@/features/lessons/components/modals/quick-create/rider/modal";
import { EventModal } from "@/features/organization/components/availability/events/modal";
import { CreateTimeBlockModal } from "@/features/organization/components/availability/time-blocks/modal";
import { ModalScope } from "@/shared/lib/stores/modal.store";

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
  const { kioskSession } = Route.useRouteContext();
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

  const data = React.useMemo(() => {
    const boardId = kioskSession.boardId;
    if (boardId === null) {
      return {
        lessons,
        timeBlocks,
        events,
        trainers,
        boards,
      };
    }

    return {
      lessons: lessons.filter((lesson) => lesson.boardId === boardId),
      timeBlocks: timeBlocks.filter(
        (timeBlock) => timeBlock.boardId === boardId
      ),
      events: events.filter(
        (event) =>
          event.boardIds === null ||
          (event.boardIds && event.boardIds.includes(boardId))
      ),
      trainers: trainers.filter((trainer) =>
        trainer.boardAssignments?.some((a) => a.boardId === boardId)
      ),
      boards: boards.filter((board) => board.id === boardId),
    };
  }, [kioskSession, lessons, timeBlocks, events, trainers, boards]);

  return (
    <CalendarProvider
      events={data.events}
      trainers={data.trainers}
      boards={data.boards}
      lessons={data.lessons}
      timeBlocks={data.timeBlocks}
      type="kiosk"
    >
      <ModalScope
        modals={[
          AdminCreateLessonModal,
          RiderCreateLessonModal,
          EventModal,
          CreateTimeBlockModal,
        ]}
      >
        <Calendar />
      </ModalScope>
    </CalendarProvider>
  );
}
