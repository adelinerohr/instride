import { useQueryClient } from "@tanstack/react-query";

import type { MutationHookOptions } from "#_internal/types";
import { useWrappedMutation } from "#_internal/types";
import { apiClient, type members } from "#client";
import {
  ChangeRoleRequest,
  JoinOrganizationRequest,
  UpdateRiderRequest,
  UpdateTrainerRequest,
} from "#contracts";

import { memberKeys } from "./keys";

export const membersMutations = {
  joinOrganization: async ({
    organizationId,
    ...request
  }: JoinOrganizationRequest) => {
    const { member } = await apiClient.organizations.joinOrganization(
      organizationId,
      request
    );
    return member;
  },

  setPin: async (pin: string) =>
    await apiClient.organizations.setKioskPin({ pin }),

  updateRider: async ({ riderId, ...request }: UpdateRiderRequest) => {
    const { rider } = await apiClient.organizations.updateRider(
      riderId,
      request
    );
    return rider;
  },

  updateTrainer: async ({ trainerId, ...request }: UpdateTrainerRequest) => {
    const { trainer } = await apiClient.organizations.updateTrainer(
      trainerId,
      request
    );
    return trainer;
  },

  onboardMember: async (params: members.OnboardMemberParams) =>
    await apiClient.organizations.onboardMember(params),

  changeRole: async ({ memberId, ...request }: ChangeRoleRequest) => {
    await apiClient.organizations.changeRole(memberId, request);
  },

  completeOnboarding: async ({ memberId }: { memberId: string }) => {
    await apiClient.organizations.completeOnboarding(memberId);
  },
};

export function useOnboardMember({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.onboardMember> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.onboardMember, {
    ...config,
    onSuccess: (member, ...args) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      onSuccess?.(member, ...args);
    },
  });
}

export function useJoinOrganization({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.joinOrganization> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.joinOrganization, {
    ...config,
    onSuccess: (member, ...args) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      queryClient.invalidateQueries({ queryKey: memberKeys.byId(member.id) });
      onSuccess?.(member, ...args);
    },
  });
}

export function useSetPin({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.setPin> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.setPin, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list() });
      queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      onSuccess?.(...args);
    },
  });
}

export function useUpdateRider({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.updateRider> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.updateRider, {
    ...config,
    onSuccess: (rider, ...args) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.riders(),
      });
      queryClient.invalidateQueries({
        queryKey: memberKeys.riderById(rider.id),
      });
      onSuccess?.(rider, ...args);
    },
  });
}

export function useUpdateTrainer({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.updateTrainer> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.updateTrainer, {
    ...config,
    onSuccess: (trainer, ...args) => {
      queryClient.setQueryData(memberKeys.trainerById(trainer.id), trainer);
      queryClient.invalidateQueries({ queryKey: memberKeys.trainers() });
      onSuccess?.(trainer, ...args);
    },
  });
}

export function useChangeRole({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.changeRole> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.changeRole, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.list(),
      });
      queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      onSuccess?.(...args);
    },
  });
}

export function useCompleteOnboarding({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.completeOnboarding> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.completeOnboarding, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      onSuccess?.(...args);
    },
  });
}
