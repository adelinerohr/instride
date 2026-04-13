import {
  businessHoursOptions,
  type types,
  useTrainerBusinessHours,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useParams } from "@tanstack/react-router";
import * as React from "react";

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
  const { slug } = useParams({ strict: false });
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

  if (isLoading || isLoadingOrganizationBusinessHours) {
    return <div>Loading...</div>;
  }

  const effectiveOrganizationBusinessHours = resolveEffectiveBusinessHours(
    organizationBusinessHours,
    selectedBoardId
  );

  let effectiveTrainerBusinessHours: TrainerEffectiveBusinessHours = {};

  if (trainers && selectedTrainerIds.length > 0) {
    for (const trainerId of selectedTrainerIds) {
      const trainer = trainers.find((trainer) => trainer.id === trainerId);
      if (trainer) {
        const { data: trainerBusinessHours } =
          useTrainerBusinessHours(trainerId);
        if (trainerBusinessHours) {
          effectiveTrainerBusinessHours[trainerId] =
            resolveEffectiveBusinessHours(
              trainerBusinessHours,
              selectedBoardId
            );
        }
      }
    }
  }

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
      navigate({
        to: "/org/$slug/admin/calendar/new",
        params: { slug: slug ?? "" },
        search: (prev) => ({
          ...prev,
          start: start.toISOString(),
          boardId,
          trainerId,
        }),
      });
    },
    [navigate, slug]
  );

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
        lessons,
        timeBlocks,
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
