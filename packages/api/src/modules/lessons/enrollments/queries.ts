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
  myEnrollments: (from: string, to: string) =>
    queryOptions({
      queryKey: lessonKeys.myEnrollmentsInRange(from, to),
      queryFn: async () => {
        const { enrollments } = await apiClient.lessons.listMyEnrollments({
          from,
          to,
        });
        return enrollments;
      },
    }),
  byRiderId: (riderId: string) =>
    queryOptions({
      queryKey: lessonKeys.byRiderId(riderId),
      queryFn: async () =>
        await apiClient.lessons.listRiderEnrollments(riderId),
      select: (data) => data.enrollments,
    }),
};

export function useMyEnrollments(from: string, to: string) {
  return useQuery(enrollmentOptions.myEnrollments(from, to));
}

export function useSeriesEnrollments(seriesId: string) {
  return useQuery(enrollmentOptions.listSeries(seriesId));
}

export function useInstanceEnrollments(instanceId: string) {
  return useQuery(enrollmentOptions.listInstance(instanceId));
}

export function useRiderEnrollments(riderId: string) {
  return useQuery(enrollmentOptions.byRiderId(riderId));
}
