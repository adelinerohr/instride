import {
  businessHoursOptions,
  type Board,
  type Event,
  type LessonInstance,
  type TimeBlock,
  type Trainer,
} from "@instride/api";
import {
  EventScope,
  resolveEffectiveBusinessHours,
  type EffectiveBusinessHours,
  type TrainerEffectiveBusinessHours,
} from "@instride/shared";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { addDays, startOfWeek } from "date-fns";
import * as React from "react";

import {
  lessonModalHandler,
  type LessonModalPayload,
} from "@/features/lessons/components/modals/new-lesson";
import { useIsMobile } from "@/shared/hooks/use-mobile";

import { CalendarView } from "../lib/types";
import { useSlotHeight } from "./use-slot-height";

interface CalendarContext {
  selectedDate: Date;
  type: "portal" | "admin" | "kiosk";
  setSelectedDate: (date: Date | undefined) => void;
  selectedTrainerIds: string[];
  setSelectedTrainerIds: (trainerIds: string[]) => void;
  trainers: Trainer[];
  boards: Board[];
  organizationBusinessHours: EffectiveBusinessHours;
  trainerBusinessHours: TrainerEffectiveBusinessHours;
  lessons: LessonInstance[];
  timeBlocks: TimeBlock[];
  organizationEvents: Event[];
  events: Event[];
  selectedView: CalendarView;
  setSelectedView: (view: CalendarView) => void;
  selectedBoardId: string | undefined;
  setSelectedBoardId: (boardId: string | undefined) => void;
  createLesson: (payload: LessonModalPayload) => void;
  selectedMultiDayCount: number;
  setSelectedMultiDayCount: (count: number) => void;
  visibleDays: Date[];
  slotHeight: number;
  quarterHeight: number;
  totalHeight: number;
}

const CalendarContext = React.createContext<CalendarContext | undefined>(
  undefined
);

interface CalendarProviderProps {
  type: "portal" | "admin" | "kiosk";
  trainers: Trainer[];
  boards: Board[];
  lessons: LessonInstance[];
  timeBlocks: TimeBlock[];
  events: Event[];
  children: React.ReactNode;
}

export function CalendarProvider({
  children,
  type,
  trainers,
  boards,
  lessons,
  timeBlocks,
  events,
}: CalendarProviderProps) {
  const isMobile = useIsMobile();

  const kioskRouteApi = getRouteApi(
    "/org/$slug/(authenticated)/kiosk/$sessionId/calendar"
  );
  const portalRouteApi = getRouteApi(
    "/org/$slug/(authenticated)/portal/calendar/"
  );
  const adminRouteApi = getRouteApi(
    "/org/$slug/(authenticated)/admin/calendar/"
  );

  const routeApi =
    type === "kiosk"
      ? kioskRouteApi
      : type === "portal"
        ? portalRouteApi
        : adminRouteApi;

  const {
    date: selectedDate,
    trainerIds: selectedTrainerIds,
    boardId: selectedBoardId,
    view: selectedView,
    multiDayCount: selectedMultiDayCount,
  } = routeApi.useSearch();

  const navigate = routeApi.useNavigate();

  const { slotHeight, quarterHeight, totalHeight } = useSlotHeight();

  // Enforce single-trainer selection on mobile
  React.useEffect(() => {
    if (!isMobile) return;
    if (selectedTrainerIds.length <= 1) return;

    // Keep the first one, drop the rest
    navigate({
      search: (prev) => ({ ...prev, trainerIds: [selectedTrainerIds[0]] }),
      replace: true,
    });
  }, [isMobile, selectedTrainerIds, navigate]);

  const date = React.useMemo(() => new Date(selectedDate), [selectedDate]);

  const visibleDays = React.useMemo(() => {
    switch (selectedView) {
      case CalendarView.WEEK:
        return Array.from({ length: 7 }, (_, i) =>
          addDays(startOfWeek(date, { weekStartsOn: 1 }), i)
        );
      case CalendarView.MULTI_DAY:
        return Array.from({ length: selectedMultiDayCount }, (_, i) =>
          addDays(date, i)
        );
      case CalendarView.DAY:
      default:
        return [date];
    }
  }, [selectedView, date, selectedMultiDayCount]);

  const { data: organizationBusinessHours } = useSuspenseQuery(
    businessHoursOptions.organization()
  );

  const organizationEvents = React.useMemo(() => {
    return events.filter((event) => event.scope === EventScope.ORGANIZATION);
  }, [events]);

  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      // Organization-scoped events - always show
      if (event.scope === EventScope.ORGANIZATION) {
        return true;
      }

      // Board-scoped events
      if (
        event.scope === EventScope.BOARD &&
        selectedBoardId &&
        event.boardIds?.includes(selectedBoardId)
      ) {
        return true;
      }

      // Trainer-scoped events - show if ANY selected trainer is in the event's trainerIds
      if (
        event.scope === EventScope.TRAINER &&
        selectedTrainerIds.length > 0 &&
        event.trainerIds?.some((trainerId) =>
          selectedTrainerIds.includes(trainerId)
        )
      ) {
        return true;
      }

      return false;
    });
  }, [events, selectedBoardId, selectedTrainerIds]);

  const filteredLessons = React.useMemo(() => {
    return lessons.filter((lesson) => {
      if (
        selectedTrainerIds.length > 0 &&
        !selectedTrainerIds.includes(lesson.trainerId)
      ) {
        return false;
      }
      if (selectedBoardId && lesson.boardId !== selectedBoardId) {
        return false;
      }
      return true;
    });
  }, [lessons, selectedTrainerIds, selectedBoardId]);

  const filteredTimeBlocks = React.useMemo(() => {
    return timeBlocks.filter((timeBlock) => {
      if (
        selectedTrainerIds.length > 0 &&
        !selectedTrainerIds.includes(timeBlock.trainerId)
      ) {
        return false;
      }
      if (selectedBoardId && timeBlock.boardId !== selectedBoardId) {
        return false;
      }
      return true;
    });
  }, [timeBlocks, selectedTrainerIds, selectedBoardId]);

  const trainerIdsToFetch = React.useMemo(
    () =>
      selectedTrainerIds.filter((id) =>
        trainers.some((trainer) => trainer.id === id)
      ),
    [selectedTrainerIds, trainers]
  );

  const trainerBusinessHoursQueries = useQueries({
    queries: trainerIdsToFetch.map((trainerId) => ({
      ...businessHoursOptions.trainer(trainerId),
    })),
  });

  const effectiveOrganizationBusinessHours = React.useMemo(
    () =>
      resolveEffectiveBusinessHours(organizationBusinessHours, selectedBoardId),
    [organizationBusinessHours, selectedBoardId]
  );

  const effectiveTrainerBusinessHours = React.useMemo(() => {
    const result: TrainerEffectiveBusinessHours = {};
    trainerIdsToFetch.forEach((trainerId, i) => {
      const data = trainerBusinessHoursQueries[i]?.data;
      if (data) {
        result[trainerId] = resolveEffectiveBusinessHours(
          data,
          selectedBoardId
        );
      }
    });
    return result;
  }, [trainerBusinessHoursQueries, trainerIdsToFetch, selectedBoardId]);

  const setSelectedDate = React.useCallback(
    (date: Date | undefined) => {
      navigate({
        search: (prev) => ({ ...prev, date: date?.toISOString() }),
      });
    },
    [navigate]
  );

  const setSelectedTrainerIds = React.useCallback(
    (trainerIds: string[]) => {
      navigate({
        search: (prev) => ({ ...prev, trainerIds }),
      });
    },
    [navigate]
  );

  const setSelectedBoardId = React.useCallback(
    (boardId: string | undefined) => {
      navigate({ search: (prev) => ({ ...prev, boardId }) });
    },
    [navigate]
  );

  const setSelectedView = React.useCallback(
    (view: CalendarView) => {
      navigate({ search: (prev) => ({ ...prev, view }) });
    },
    [navigate]
  );

  const setSelectedMultiDayCount = React.useCallback(
    (count: number) => {
      navigate({ search: (prev) => ({ ...prev, multiDayCount: count }) });
    },
    [navigate]
  );

  const createLesson = React.useCallback(
    (payload: LessonModalPayload) => {
      if (type === "admin") {
        lessonModalHandler.openWithPayload(payload);
      } else {
        navigate({
          to: "/org/$slug/portal/lessons/create",
        });
      }
    },
    [type, navigate]
  );

  return (
    <CalendarContext.Provider
      value={{
        type,
        selectedDate: date,
        setSelectedDate,
        selectedTrainerIds,
        setSelectedTrainerIds,
        selectedBoardId,
        setSelectedBoardId,
        selectedView,
        setSelectedView,
        trainers,
        boards,
        organizationEvents,
        events: filteredEvents,
        organizationBusinessHours: effectiveOrganizationBusinessHours,
        trainerBusinessHours: effectiveTrainerBusinessHours,
        lessons: filteredLessons,
        timeBlocks: filteredTimeBlocks,
        createLesson,
        selectedMultiDayCount,
        setSelectedMultiDayCount,
        visibleDays,
        slotHeight,
        quarterHeight,
        totalHeight,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = React.useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
