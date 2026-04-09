import type {
  CreateWaiverRequest,
  GetWaiversResponse,
  UpdateWaiverRequest,
} from "@instride/shared/contracts";
import { useQueryClient } from "@tanstack/react-query";

import {
  getOrganizationId,
  type MutationHookOptions,
  type OrganizationMutationHookOptions,
} from "#_internal";
import { mutation } from "#_internal/wrappers";
import { apiClient } from "#client";

import { waiverKeys } from "./keys";

export const waiverMutations = {
  create: async ({
    organizationId,
    request,
  }: {
    organizationId: string;
    request: CreateWaiverRequest;
  }) => {
    const { waiver } = await apiClient.waivers.create(organizationId, {
      request,
    });
    return waiver;
  },
  update: async ({
    waiverId,
    request,
  }: {
    waiverId: string;
    request: UpdateWaiverRequest;
  }) => {
    const { waiver } = await apiClient.waivers.update(waiverId, { request });
    return waiver;
  },
  archive: async (waiverId: string) => {
    await apiClient.waivers.archive(waiverId);
  },
};

export function useCreateWaiver({
  mutationConfig,
}: OrganizationMutationHookOptions<typeof waiverMutations.create> = {}) {
  const organizationId = getOrganizationId();
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.organization(waiverMutations.create, {
    ...config,
    onSuccess: (waiver, ...args) => {
      queryClient.setQueryData(
        waiverKeys(organizationId).all(),
        (old: GetWaiversResponse) => ({
          waivers: [...old.waivers, waiver],
        })
      );
      queryClient.invalidateQueries({
        queryKey: [waiverKeys(organizationId).all()],
      });
      onSuccess?.(waiver, ...args);
    },
  });
}

export function useUpdateWaiver({
  mutationConfig,
}: MutationHookOptions<typeof waiverMutations.update> = {}) {
  const organizationId = getOrganizationId();
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.base(waiverMutations.update, {
    ...config,
    onSuccess: (waiver, ...args) => {
      queryClient.setQueryData(
        waiverKeys(organizationId).byId(waiver.id),
        waiver
      );
      queryClient.invalidateQueries({
        queryKey: [waiverKeys(organizationId).byId(waiver.id)],
      });
      onSuccess?.(waiver, ...args);
    },
  });
}

export function useArchiveWaiver({
  mutationConfig,
}: MutationHookOptions<typeof waiverMutations.archive>) {
  const organizationId = getOrganizationId();
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.base(waiverMutations.archive, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [waiverKeys(organizationId).all()],
      });
      onSuccess?.(...args);
    },
  });
}
