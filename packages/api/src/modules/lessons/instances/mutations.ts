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
    await apiClient.lessons.cancelLessonInstance(instanceId, request);
  },
};

export function useCancelLessonInstance({
  mutationConfig,
}: MutationHookOptions<typeof instanceMutations.cancel> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(instanceMutations.cancel, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      onSuccess?.(...args);
    },
  });
}
