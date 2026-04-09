import { getRouteApi } from "@tanstack/react-router";

import type { CalendarView } from "../lib/types";

export function useCalendarSearch(isPortal: boolean) {
  const portalRouteApi = getRouteApi(
    "/org/$slug/(authenticated)/portal/calendar/"
  );
  const adminRouteApi = getRouteApi(
    "/org/$slug/(authenticated)/admin/calendar/"
  );

  const routeApi = isPortal ? portalRouteApi : adminRouteApi;

  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  return {
    search,
    setView: (view: CalendarView) =>
      navigate({ search: (prev) => ({ ...prev, view }) }),
    setDate: (date: string) =>
      navigate({ search: (prev) => ({ ...prev, date }) }),
    setTrainerIds: (trainerIds?: string[]) =>
      navigate({ search: (prev) => ({ ...prev, trainerIds }) }),
    setBoardId: (boardId?: string) =>
      navigate({ search: (prev) => ({ ...prev, boardId }) }),
    openLesson: (lessonId: string) =>
      navigate({ search: (prev) => ({ ...prev, lessonId }) }),
    openCreateBlock: () =>
      navigate({ search: (prev) => ({ ...prev, createTimeBlock: true }) }),
    openBlock: (timeBlockId: string) =>
      navigate({ search: (prev) => ({ ...prev, timeBlockId }) }),
    closeModals: () =>
      navigate({
        search: (prev) => ({
          ...prev,
          lessonId: undefined,
          timeBlockId: undefined,
          createTimeBlock: undefined,
        }),
      }),
  };
}
