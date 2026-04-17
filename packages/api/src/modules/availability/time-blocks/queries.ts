import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { availabilityKeys } from "../keys";

// ---- Query Options ------------------------------------------------------------

export const timeBlockOptions = {
  all: () =>
    queryOptions({
      queryKey: availabilityKeys.listTimeBlocks(),
      queryFn: async () => {
        const { timeBlocks } = await apiClient.availability.listTimeBlocks({});
        return timeBlocks;
      },
    }),
  byId: (id: string) =>
    queryOptions({
      queryKey: availabilityKeys.timeBlockById(id),
      queryFn: async () => {
        const { timeBlock } = await apiClient.availability.getTimeBlock(id);
        return timeBlock;
      },
    }),
  inRange: (from: Date, to: Date) =>
    queryOptions({
      queryKey: availabilityKeys.timeBlocksInRange(from, to),
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
      queryKey: availabilityKeys.timeBlocksForTrainer(trainerId),
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
