import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, type time_blocks } from "#client";

import { timeBlockKeys } from "../keys";

// ---- Standalone functions ----------------------------------------------

export const timeBlockMutations = {
  create: async (request: time_blocks.CreateTimeBlockRequest) => {
    const { timeBlock } = await apiClient.availability.createTimeBlock(request);
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
        queryKey: timeBlockKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: timeBlockKeys.forTrainer(timeBlock.trainerId),
      });
      onSuccess?.(timeBlock, ...args);
    },
  });
}

export function useDeleteTimeBlock({
  mutationConfig,
}: MutationHookOptions<typeof timeBlockMutations.delete> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(timeBlockMutations.delete, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: timeBlockKeys.all(),
      });
      onSuccess?.(...args);
    },
  });
}
