import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, guardians } from "#client";

import { guardianKeys } from "./keys";

// ---- Standalone functions ----------------------------------------------

export const guardianMutations = {
  createRelationship: async ({
    organizationId,
    request,
  }: {
    organizationId: string;
    request: guardians.CreateGuardianRelationshipRequest;
  }) => {
    return await apiClient.guardians.createGuardianRelationship(
      organizationId,
      request
    );
  },

  createPlaceholderRelationship: async ({
    organizationId,
    request,
  }: {
    organizationId: string;
    request: guardians.CreatePlaceholderRelationshipRequest;
  }) => {
    return await apiClient.guardians.createPlaceholderRelationship(
      organizationId,
      request
    );
  },

  updateRelationship: async ({
    relationshipId,
    request,
  }: {
    relationshipId: string;
    request: guardians.UpdateGuardianRelationshipRequest;
  }) => {
    return await apiClient.guardians.updateGuardianRelationship(
      relationshipId,
      request
    );
  },

  confirmRelationship: async ({
    relationshipId,
  }: {
    relationshipId: string;
  }) => {
    return await apiClient.guardians.confirmRelationship(relationshipId);
  },

  revokeRelationship: async ({
    relationshipId,
  }: {
    relationshipId: string;
  }) => {
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
        queryKey: guardianKeys.byGuardian(result.relationship.guardianMemberId),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.byDependent(
          result.relationship.dependentMemberId
        ),
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
}: MutationHookOptions<typeof guardianMutations.confirmRelationship> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(guardianMutations.confirmRelationship, {
    ...config,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({
        queryKey: guardianKeys.relationship(result.relationship.id),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.myGuardians(),
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
        queryKey: guardianKeys.relationship(result.relationship.id),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.myGuardians(),
      });
      queryClient.invalidateQueries({
        queryKey: guardianKeys.byDependent(
          result.relationship.dependentMemberId
        ),
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
        queryKey: guardianKeys.myGuardians(),
      });
      onSuccess?.(result, ...args);
    },
  });
}
