import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, type time_blocks, type types } from "#client";

import { availabilityKeys } from "../keys";

// ---- Standalone functions ----------------------------------------------

export const timeBlockMutations = {
  create: async (request: time_blocks.CreateTimeBlockRequest) => {
    const { timeBlock } = await apiClient.availability.createTimeBlock(request);
    return timeBlock;
  },
  update: async ({
    id,
    request,
  }: {
    id: string;
    request: time_blocks.UpdateTimeBlockRequest;
  }) => {
    const { timeBlock } = await apiClient.availability.updateTimeBlock(
      id,
      request
    );
    return timeBlock;
  },

  delete: async (id: string) => {
    await apiClient.availability.deleteTimeBlock(id);
  },
};

// ---- Hooks --------------------------------------------------------------------

export function useCreateTimeBlock({
  mutationConfig,
}: MutationHookOptions<typeof timeBlockMutations.create> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(timeBlockMutations.create, {
    ...config,
    onSuccess: (timeBlock, ...args) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.listTimeBlocks(),
      });
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.timeBlocksForTrainer(timeBlock.trainerId),
      });
      onSuccess?.(timeBlock, ...args);
    },
  });
}

export function useUpdateTimeBlock({
  mutationConfig,
}: MutationHookOptions<typeof timeBlockMutations.update> & {
  timeBlock?: types.TimeBlock;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(timeBlockMutations.update, {
    ...config,
    onSuccess: (timeBlock, ...args) => {
      if (!timeBlock) return;

      queryClient.setQueryData(
        availabilityKeys.timeBlockById(timeBlock.id),
        timeBlock
      );
      onSuccess?.(timeBlock, ...args);
    },
  });
}

export function useDeleteTimeBlock({
  timeBlock,
  mutationConfig,
}: MutationHookOptions<typeof timeBlockMutations.delete> & {
  timeBlock?: types.TimeBlock;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(timeBlockMutations.delete, {
    ...config,
    onSuccess: (...args) => {
      if (!timeBlock) return;

      queryClient.removeQueries({
        queryKey: availabilityKeys.timeBlockById(timeBlock.id),
      });
      queryClient.setQueryData(
        availabilityKeys.listTimeBlocks(),
        (oldData: types.TimeBlock[]) => {
          if (!oldData) return oldData;
          return oldData.filter(
            (oldTimeBlock) => oldTimeBlock.id !== timeBlock.id
          );
        }
      );
      queryClient.setQueryData(
        availabilityKeys.timeBlocksForTrainer(timeBlock.trainerId),
        (oldData: types.TimeBlock[]) => {
          if (!oldData) return oldData;
          return oldData.filter(
            (oldTimeBlock) => oldTimeBlock.id !== timeBlock.id
          );
        }
      );
      onSuccess?.(...args);
    },
  });
}
