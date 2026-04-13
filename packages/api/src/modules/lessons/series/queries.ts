import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { lessonKeys } from "../keys";

export const lessonSeriesOptions = {
  list: () =>
    queryOptions({
      queryKey: lessonKeys.series(),
      queryFn: async () => {
        const { series } = await apiClient.lessons.listLessonSeries();
        return series;
      },
    }),
  byId: (seriesId: string) =>
    queryOptions({
      queryKey: lessonKeys.seriesById(seriesId),
      queryFn: async () => {
        const { series } = await apiClient.lessons.getLessonSeries(seriesId);
        return series;
      },
    }),
};

export function useListLessonSeries() {
  return useQuery(lessonSeriesOptions.list());
}

export function useGetLessonSeries(seriesId: string) {
  return useQuery(lessonSeriesOptions.byId(seriesId));
}
