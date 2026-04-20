import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, guardians } from "#client";

import { guardianKeys } from "./keys";

// ---- Standalone functions ----------------------------------------------

export const guardianMutations = {
  createRelationship: async (
    params: guardians.CreateGuardianRelationshipParams
  ) => {
    return await apiClient.guardians.createGuardianRelationship(params);
  },

  createPlaceholderRelationship: async (
    params: guardians.CreatePlaceholderRelationshipParams
  ) => {
    return await apiClient.guardians.createPlaceholderRelationship(params);
  },

  updateRelationship: async (input: {
    relationshipId: string;
    params: guardians.UpdateGuardianRelationshipRequest;
  }) => {
    return await apiClient.guardians.updateGuardianRelationship(
      input.relationshipId,
      input.params
    );
  },

  acceptRelationship: async (relationshipId: string) => {
    return await apiClient.guardians.acceptRelationship(relationshipId);
  },

  revokeRelationship: async (relationshipId: string) => {
    return await apiClient.guardians.revokeRelationship(relationshipId);
  },
};

// ---- Hooks --------------------------------------------------------------------

export function useCreateRelationship({
  mutationConfig,
}: MutationHookOptions<typeof guardianMutations.createRelationship> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(guardianMutations.createRelationship, {
    ...config,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({
        queryKey: guardianKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.byGuardian(result.guardianMemberId),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.byDependent(result.dependentMemberId),
      });
      onSuccess?.(result, ...args);
    },
  });
}

export function useCreatePlaceholderRelationship({
  mutationConfig,
}: MutationHookOptions<
  typeof guardianMutations.createPlaceholderRelationship
> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(guardianMutations.createPlaceholderRelationship, {
    ...config,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({
        queryKey: guardianKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.myDependents(),
      });
      onSuccess?.(result, ...args);
    },
  });
}

export function useConfirmRelationship({
  mutationConfig,
}: MutationHookOptions<typeof guardianMutations.acceptRelationship> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(guardianMutations.acceptRelationship, {
    ...config,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({
        queryKey: guardianKeys.relationship(result.id),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.myGuardian(),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.pending(),
      });
      onSuccess?.(result, ...args);
    },
  });
}

export function useUpdateGuardianRelationship({
  mutationConfig,
}: MutationHookOptions<typeof guardianMutations.updateRelationship> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(guardianMutations.updateRelationship, {
    ...config,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({
        queryKey: guardianKeys.relationship(result.id),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.myGuardian(),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.byDependent(result.dependentMemberId),
      });
      onSuccess?.(result, ...args);
    },
  });
}

export function useRevokeRelationship({
  mutationConfig,
}: MutationHookOptions<typeof guardianMutations.revokeRelationship> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(guardianMutations.revokeRelationship, {
    ...config,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({
        queryKey: guardianKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.myDependents(),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.myGuardian(),
      });
      onSuccess?.(result, ...args);
    },
  });
}
