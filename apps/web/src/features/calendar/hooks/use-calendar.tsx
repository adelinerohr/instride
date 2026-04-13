import { businessHoursOptions, type types } from "@instride/api";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import * as React from "react";

import { lessonModalHandler } from "@/features/lessons/components/modals/new-lesson";

import type {
  CalendarView,
  EffectiveBusinessHours,
  TrainerEffectiveBusinessHours,
} from "../lib/types";
import { resolveEffectiveBusinessHours } from "../utils/business-hours";

interface CalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTrainerIds: string[];
  setSelectedTrainerIds: (trainerIds: string[]) => void;
  trainers: types.Trainer[];
  boards: types.Board[];
  organizationBusinessHours: EffectiveBusinessHours;
  trainerBusinessHours: TrainerEffectiveBusinessHours;
  lessons: types.LessonInstance[];
  timeBlocks: types.TimeBlock[];
  selectedView: CalendarView;
  setSelectedView: (view: CalendarView) => void;
  selectedBoardId: string | undefined;
  setSelectedBoardId: (boardId: string | undefined) => void;
  createLesson: (start: Date, boardId: string, trainerId?: string) => void;
}

const CalendarContext = React.createContext<CalendarContext | undefined>(
  undefined
);

interface CalendarProviderProps {
  isPortal: boolean;
  isLoading: boolean;
  trainers: types.Trainer[];
  boards: types.Board[];
  lessons: types.LessonInstance[];
  timeBlocks: types.TimeBlock[];
  children: React.ReactNode;
}

export function CalendarProvider({
  children,
  isPortal,
  trainers,
  boards,
  isLoading,
  lessons,
  timeBlocks,
}: CalendarProviderProps) {
  const portalRouteApi = getRouteApi(
    "/org/$slug/(authenticated)/portal/calendar/"
  );
  const adminRouteApi = getRouteApi(
    "/org/$slug/(authenticated)/admin/calendar/"
  );

  const routeApi = isPortal ? portalRouteApi : adminRouteApi;

  const {
    date: selectedDate,
    trainerIds: selectedTrainerIds,
    boardId: selectedBoardId,
    view: selectedView,
  } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const date = new Date(selectedDate);
  const {
    data: organizationBusinessHours,
    isLoading: isLoadingOrganizationBusinessHours,
  } = useSuspenseQuery(businessHoursOptions.organization());

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
  }, [lessons, date]);

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
  }, [timeBlocks, date]);

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
    for (let i = 0; i < trainerIdsToFetch.length; i++) {
      const trainerId = trainerIdsToFetch[i];
      const trainerBusinessHours = trainerBusinessHoursQueries[i]?.data;
      if (trainerBusinessHours) {
        result[trainerId] = resolveEffectiveBusinessHours(
          trainerBusinessHours,
          selectedBoardId
        );
      }
    }
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

  const createLesson = React.useCallback(
    (start: Date, boardId: string, trainerId?: string) => {
      lessonModalHandler.openWithPayload({
        start: start.toISOString(),
        boardId,
        trainerId,
      });
    },
    [lessonModalHandler]
  );

  if (isLoading || isLoadingOrganizationBusinessHours) {
    return <div>Loading...</div>;
  }

  return (
    <CalendarContext.Provider
      value={{
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
        organizationBusinessHours: effectiveOrganizationBusinessHours,
        trainerBusinessHours: effectiveTrainerBusinessHours,
        lessons: filteredLessons,
        timeBlocks: filteredTimeBlocks,
        createLesson,
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
