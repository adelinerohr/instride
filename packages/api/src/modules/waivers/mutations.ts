import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, waivers } from "#client";

import { waiverKeys } from "./keys";

export const waiverMutations = {
  create: async (request: waivers.CreateWaiverRequest) => {
    const { waiver } = await apiClient.waivers.createWaiver(request);
    return waiver;
  },
  update: async ({
    waiverId,
    request,
  }: {
    waiverId: string;
    request: waivers.UpdateWaiverRequest;
  }) => {
    const { waiver } = await apiClient.waivers.updateWaiver(waiverId, request);
    return waiver;
  },
  archive: async (waiverId: string) => {
    await apiClient.waivers.archiveWaiver(waiverId);
  },

  // Signatures
  sign: async (input: {
    waiverId: string;
    request: waivers.SignWaiverRequest;
  }) => {
    const { signature } = await apiClient.waivers.signWaiver(
      input.waiverId,
      input.request
    );
    return signature;
  },
};

export function useCreateWaiver({
  mutationConfig,
}: MutationHookOptions<typeof waiverMutations.create> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(waiverMutations.create, {
    ...config,
    onSuccess: (waiver, ...args) => {
      queryClient.invalidateQueries({
        queryKey: waiverKeys.list(),
      });
      onSuccess?.(waiver, ...args);
    },
  });
}

export function useUpdateWaiver({
  mutationConfig,
}: MutationHookOptions<typeof waiverMutations.update> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(waiverMutations.update, {
    ...config,
    onSuccess: (waiver, ...args) => {
      queryClient.setQueryData(waiverKeys.byId(waiver.id), waiver);
      queryClient.invalidateQueries({
        queryKey: waiverKeys.byId(waiver.id),
      });
      onSuccess?.(waiver, ...args);
    },
  });
}

export function useArchiveWaiver({
  mutationConfig,
}: MutationHookOptions<typeof waiverMutations.archive> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(waiverMutations.archive, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: waiverKeys.list(),
      });
      onSuccess?.(...args);
    },
  });
}

export function useSignWaiver({
  mutationConfig,
}: MutationHookOptions<typeof waiverMutations.sign> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(waiverMutations.sign, {
    ...config,
    onSuccess: (signature, ...args) => {
      queryClient.invalidateQueries({
        queryKey: waiverKeys.byId(signature.waiverId),
      });
      onSuccess?.(signature, ...args);
    },
  });
}
