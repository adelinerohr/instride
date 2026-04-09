import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { lessonKeys } from "../keys";

export const enrollmentOptions = {
  listSeries: (seriesId: string) =>
    queryOptions({
      queryKey: lessonKeys.seriesEnrollments(seriesId),
      queryFn: async () =>
        await apiClient.lessons.listSeriesEnrollments(seriesId),
    }),
  listInstance: (instanceId: string) =>
    queryOptions({
      queryKey: lessonKeys.instanceEnrollments(instanceId),
      queryFn: async () =>
        await apiClient.lessons.listInstanceEnrollments(instanceId),
    }),
  myEnrollments: () =>
    queryOptions({
      queryKey: lessonKeys.myEnrollments(),
      queryFn: async () => await apiClient.lessons.listMyEnrollments(),
    }),
};

export function useMyEnrollments() {
  return useQuery(enrollmentOptions.myEnrollments());
}

export function useSeriesEnrollments(seriesId: string) {
  return useQuery(enrollmentOptions.listSeries(seriesId));
}

export function useInstanceEnrollments(instanceId: string) {
  return useQuery(enrollmentOptions.listInstance(instanceId));
}
