import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import { STALE } from "#_internal";
import { apiClient } from "#client";
import { ListLessonInstancesResponse } from "#contracts";

import { lessonKeys } from "../keys";

export const instanceOptions = {
  // Primary calendar query - always date-scoped
  inRange: (from: Date, to: Date) => {
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
    return queryOptions({
      queryKey: lessonKeys.instancesInRange(fromStr, toStr),
      queryFn: async () =>
        await apiClient.lessons.listLessonInstances({
          from: fromStr,
          to: toStr,
        }),
      select: (data) => data.instances,
      staleTime: STALE.MINUTES.ONE,
    });
  },

  byId: (instanceId: string) => {
    return queryOptions({
      queryKey: lessonKeys.instanceById(instanceId),
      queryFn: async () =>
        await apiClient.lessons.getLessonInstance(instanceId),
      select: (data) => data.instance,
      staleTime: STALE.MINUTES.ONE,
    });
  },

  byTrainer: (trainerId: string) => {
    return queryOptions({
      queryKey: lessonKeys.instancesByTrainer(trainerId),
      queryFn: async () =>
        await apiClient.lessons.listInstancesByTrainer(trainerId),
      select: (data) => data.instances,
    });
  },

  stats: () => {
    return queryOptions({
      queryKey: lessonKeys.instanceStats(),
      queryFn: async () => await apiClient.lessons.getLessonStats(),
    });
  },
};

export function useListLessonInstances(from: Date, to: Date) {
  return useQuery(instanceOptions.inRange(from, to));
}

export function useLessonInstance(instanceId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    ...instanceOptions.byId(instanceId),
    initialData: () => {
      const lists = queryClient.getQueriesData<ListLessonInstancesResponse>({
        queryKey: lessonKeys.instanceLists(),
      });

      for (const [, listData] of lists) {
        const found = listData?.instances.find(
          (instance) => instance.id === instanceId
        );
        if (found) {
          return { instance: found };
        }
      }

      return undefined;
    },
    initialDataUpdatedAt: () => {
      const timestamps = queryClient
        .getQueryCache()
        .findAll({
          queryKey: lessonKeys.instanceLists(),
        })
        .map((query) => query.state.dataUpdatedAt);

      return timestamps.length > 0 ? Math.max(...timestamps) : undefined;
    },
  });
}

export function useGetLessonStats() {
  return useQuery(instanceOptions.stats());
}

export function useListLessonInstancesByTrainer(trainerId: string) {
  return useQuery(instanceOptions.byTrainer(trainerId));
}
