import { useQueryClient } from "@tanstack/react-query";

import type {
  MutationHookOptions,
  OrganizationMutationHookOptions,
} from "#_internal/types";
import { useWrappedMutation } from "#_internal/types";
import { apiClient, type members } from "#client";

import { memberKeys } from "./keys";

export const membersMutations = {
  joinOrganization: async ({ organizationId }: { organizationId: string }) => {
    const { member } =
      await apiClient.organizations.joinOrganization(organizationId);
    return member;
  },

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
}: OrganizationMutationHookOptions<typeof membersMutations.joinOrganization>) {
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
