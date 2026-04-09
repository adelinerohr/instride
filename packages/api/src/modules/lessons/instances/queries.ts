import { queryOptions, useQuery } from "@tanstack/react-query";

import { STALE } from "#_internal";
import { apiClient } from "#client";

import { lessonKeys } from "../keys";

export const instanceOptions = {
  // Primary calendar query - always date-scoped
  inRange: (from: Date, to: Date) => {
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
    return queryOptions({
      queryKey: lessonKeys.instancesInRange(fromStr, toStr),
      queryFn: async () => {
        const { instances } = await apiClient.lessons.listLessonInstances({
          from: fromStr,
          to: toStr,
        });
        return instances;
      },
      staleTime: STALE.MINUTES.ONE,
    });
  },

  byId: (instanceId: string) => {
    return queryOptions({
      queryKey: lessonKeys.instanceById(instanceId),
      queryFn: async () => {
        return await apiClient.lessons.getLessonInstance(instanceId);
      },
    });
  },
};

export function useListLessonInstances(from: Date, to: Date) {
  return useQuery(instanceOptions.inRange(from, to));
}

export function useGetLessonInstance(instanceId: string) {
  return useQuery(instanceOptions.byId(instanceId));
}
