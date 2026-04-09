import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { lessonKeys } from "../keys";

export const lessonSeriesOptions = {
  list: () =>
    queryOptions({
      queryKey: lessonKeys.series(),
      queryFn: async () => await apiClient.lessons.listLessonSeries(),
    }),
  byId: (seriesId: string) =>
    queryOptions({
      queryKey: lessonKeys.seriesById(seriesId),
      queryFn: async () => await apiClient.lessons.getLessonSeries(seriesId),
    }),
};

export function useListLessonSeries() {
  return useQuery(lessonSeriesOptions.list());
}

export function useGetLessonSeries(seriesId: string) {
  return useQuery(lessonSeriesOptions.byId(seriesId));
}
