import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, type business_hours } from "#client";

import { availabilityKeys } from "../keys";

export const businessHoursMutations = {
  checkLessonHours: async (request: business_hours.CheckLessonHoursRequest) =>
    await apiClient.availability.checkLessonHours(request),
};

export const organizationBusinessHoursMutations = {
  upsert: async (
    params: business_hours.UpdateOrganizationBusinessHoursParams
  ) => await apiClient.availability.updateOrganizationBusinessHours(params),
  reset: async ({ boardId }: { boardId: string }) =>
    await apiClient.availability.resetBoardBusinessHours(boardId),
};

export const trainerBusinessHoursMutations = {
  upsert: async (input: {
    trainerId: string;
    params: business_hours.UpdateTrainerBusinessHoursParams;
  }) =>
    await apiClient.availability.updateTrainerBusinessHours(
      input.trainerId,
      input.params
    ),
  resetBoard: async (input: { trainerId: string; boardId: string }) =>
    await apiClient.availability.resetTrainerBoardBusinessHours(
      input.trainerId,
      input.boardId
    ),
};

export function useUpsertOrganizationBusinessHours({
  mutationConfig,
}: MutationHookOptions<typeof organizationBusinessHoursMutations.upsert> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(organizationBusinessHoursMutations.upsert, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.listBusinessHours(),
      });
      onSuccess?.(...args);
    },
  });
}

export function useResetOrganizationBusinessHours({
  mutationConfig,
}: MutationHookOptions<typeof organizationBusinessHoursMutations.reset> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(organizationBusinessHoursMutations.reset, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.listBusinessHours(),
      });
      onSuccess?.(...args);
    },
  });
}

export function useCheckLessonHours({
  mutationConfig,
}: MutationHookOptions<typeof businessHoursMutations.checkLessonHours> = {}) {
  return useWrappedMutation(
    businessHoursMutations.checkLessonHours,
    mutationConfig || {}
  );
}

export function useUpsertTrainerBusinessHours({
  mutationConfig,
}: MutationHookOptions<typeof trainerBusinessHoursMutations.upsert> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(trainerBusinessHoursMutations.upsert, {
    ...config,
    onSuccess: (result, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.trainerBusinessHours(variables.trainerId),
      });
      onSuccess?.(result, variables, ...args);
    },
  });
}

export function useResetTrainerBusinessHours({
  trainerId,
  mutationConfig,
}: MutationHookOptions<
  (vars: {
    boardId: string;
  }) => ReturnType<typeof trainerBusinessHoursMutations.resetBoard>
> & {
  trainerId: string;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(
    ({ boardId }: { boardId: string }) =>
      trainerBusinessHoursMutations.resetBoard({ trainerId, boardId }),
    {
      ...config,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({
          queryKey: availabilityKeys.trainerBusinessHours(trainerId),
        });
        onSuccess?.(...args);
      },
    }
  );
}
