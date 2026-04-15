import { useQueryClient } from "@tanstack/react-query";

import type { MutationHookOptions } from "#_internal/types";
import { useWrappedMutation } from "#_internal/types";
import { apiClient, type members } from "#client";

import { memberKeys } from "./keys";

export const membersMutations = {
  joinOrganization: async ({ organizationId }: { organizationId: string }) => {
    const { member } =
      await apiClient.organizations.joinOrganization(organizationId);
    return member;
  },

  setPin: async (pin: string) =>
    await apiClient.organizations.setKioskPin({ pin }),

  updateRider: async ({
    riderId,
    request,
  }: {
    riderId: string;
    request: members.UpdateRiderRequest;
  }) => {
    const { rider } = await apiClient.organizations.updateRider(
      riderId,
      request
    );
    return rider;
  },

  updateTrainer: async ({
    trainerId,
    request,
  }: {
    trainerId: string;
    request: members.UpdateTrainerRequest;
  }) => {
    const { trainer } = await apiClient.organizations.updateTrainer(
      trainerId,
      request
    );
    return trainer;
  },

  changeRole: async ({
    memberId,
    request,
  }: {
    memberId: string;
    request: members.ChangeRoleRequest;
  }) => {
    await apiClient.organizations.changeRole(memberId, request);
  },
};

export function useJoinOrganization({
  mutationConfig,
}: MutationHookOptions<typeof membersMutations.joinOrganization> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(membersMutations.joinOrganization, {
    ...config,
    onSuccess: (member, ...args) => {
      queryClient.setQueryData(
        memberKeys.list(),
        (
          old: Awaited<
            ReturnType<typeof apiClient.organizations.listMembers>
          >["members"]
        ) => [...old, member]
      );
      queryClient.invalidateQueries({
        queryKey: [memberKeys.list(), memberKeys.byId(member.id)],
      });
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
      onSuccess?.(...args);
    },
  });
}
