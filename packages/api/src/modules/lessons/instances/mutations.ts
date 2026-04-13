import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, type instances } from "#client";

import { lessonKeys } from "../keys";

export const instanceMutations = {
  cancel: async ({
    instanceId,
    request,
  }: {
    instanceId: string;
    request: instances.CancelLessonInstanceRequest;
  }) => {
    const response = await apiClient.lessons.cancelLessonInstance(
      instanceId,
      request
    );
    return response.instance;
  },

  update: async ({
    instanceId,
    request,
  }: {
    instanceId: string;
    request: instances.UpdateLessonInstanceRequest;
  }) => {
    const response = await apiClient.lessons.updateLessonInstance(
      instanceId,
      request
    );
    return response.instance;
  },
};

export function useCancelLessonInstance({
  mutationConfig,
}: MutationHookOptions<typeof instanceMutations.cancel> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(instanceMutations.cancel, {
    ...config,
    onSuccess: (instance, ...args) => {
      queryClient.removeQueries({
        queryKey: lessonKeys.instanceById(instance.id),
      });
      queryClient.invalidateQueries({
        queryKey: lessonKeys.instances(),
      });
      onSuccess?.(instance, ...args);
    },
  });
}

export function useUpdateLessonInstance({
  mutationConfig,
}: MutationHookOptions<typeof instanceMutations.update> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(instanceMutations.update, {
    ...config,
    onSuccess: (instance, ...args) => {
      queryClient.setQueryData(lessonKeys.instanceById(instance.id), instance);
      queryClient.invalidateQueries({
        queryKey: lessonKeys.instanceById(instance.id),
      });
      queryClient.invalidateQueries({
        queryKey: lessonKeys.instances(),
      });
      onSuccess?.(instance, ...args);
    },
  });
}
