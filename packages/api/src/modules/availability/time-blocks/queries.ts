import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { timeBlockKeys } from "../keys";

// ---- Query Options ------------------------------------------------------------

export const timeBlockOptions = {
  all: () =>
    queryOptions({
      queryKey: timeBlockKeys.all(),
      queryFn: async () => {
        const { timeBlocks } = await apiClient.availability.listTimeBlocks({});
        return timeBlocks;
      },
    }),
  byId: (id: string) =>
    queryOptions({
      queryKey: timeBlockKeys.byId(id),
      queryFn: async () => {
        const { timeBlock } = await apiClient.availability.getTimeBlock(id);
        return timeBlock;
      },
    }),
  inRange: (from: Date, to: Date) =>
    queryOptions({
      queryKey: timeBlockKeys.inRange(from, to),
      queryFn: async () => {
        const { timeBlocks } = await apiClient.availability.listTimeBlocks({
          from: from.toISOString(),
          to: to.toISOString(),
        });
        return timeBlocks;
      },
    }),
  forTrainer: (trainerId: string) =>
    queryOptions({
      queryKey: timeBlockKeys.forTrainer(trainerId),
      queryFn: async () => {
        const { timeBlocks } = await apiClient.availability.listTimeBlocks({
          trainerId: trainerId,
        });
        return timeBlocks;
      },
    }),
};

// ---- Hooks --------------------------------------------------------------------

export function useTimeBlocks() {
  return useQuery(timeBlockOptions.all());
}

export function useTimeBlock(id: string) {
  return useQuery(timeBlockOptions.byId(id));
}

export function useTimeBlocksInRange(from: Date, to: Date) {
  return useQuery(timeBlockOptions.inRange(from, to));
}

export function useTimeBlocksForTrainer(trainerId: string) {
  return useQuery(timeBlockOptions.forTrainer(trainerId));
}
