import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, type business_hours } from "#client";

import { businessHoursKeys } from "../keys";

export const businessHoursMutations = {
  checkLessonHours: async (request: business_hours.CheckLessonHoursRequest) =>
    await apiClient.availability.checkLessonHours(request),
};

export const organizationBusinessHoursMutations = {
  upsert: async (
    request: business_hours.UpdateOrganizationBusinessHoursRequest
  ) => await apiClient.availability.updateOrganizationBusinessHours(request),
  reset: async ({ boardId }: { boardId: string }) =>
    await apiClient.availability.resetBoardBusinessHours(boardId),
};

export const trainerBusinessHoursMutations = {
  upsert: async ({
    trainerId,
    request,
  }: {
    trainerId: string;
    request: business_hours.UpdateTrainerBusinessHoursRequest;
  }) =>
    await apiClient.availability.updateTrainerBusinessHours(trainerId, request),
  resetBoard: async ({
    trainerId,
    boardId,
  }: {
    trainerId: string;
    boardId: string;
  }) =>
    await apiClient.availability.resetTrainerBoardBusinessHours(
      trainerId,
      boardId
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
        queryKey: businessHoursKeys.list(),
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
        queryKey: businessHoursKeys.list(),
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
  trainerId,
  mutationConfig,
}: MutationHookOptions<typeof trainerBusinessHoursMutations.upsert> & {
  trainerId: string;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(trainerBusinessHoursMutations.upsert, {
    ...config,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({
        queryKey: businessHoursKeys.trainer(trainerId),
      });
      onSuccess?.(result, ...args);
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
          queryKey: businessHoursKeys.trainer(trainerId),
        });
        onSuccess?.(...args);
      },
    }
  );
}
