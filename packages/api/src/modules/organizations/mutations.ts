import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, organizations, type levels } from "#client";

import { organizationKeys } from "./keys";

export const organizationMutations = {
  create: async (request: organizations.CreateOrganizationRequest) => {
    const { organization } =
      await apiClient.organizations.createOrganization(request);
    return organization;
  },
  update: async (input: {
    organizationId: string;
    request: organizations.UpdateOrganizationRequest;
  }) => {
    const { organization } = await apiClient.organizations.updateOrganization(
      input.organizationId,
      input.request
    );
    return organization;
  },
};

export const levelMutations = {
  create: async (request: levels.CreateLevelRequest) => {
    const { level } = await apiClient.organizations.createLevel(request);
    return level;
  },
  update: async (input: {
    levelId: string;
    request: levels.UpdateLevelRequest;
  }) => {
    const { level } = await apiClient.organizations.updateLevel(
      input.levelId,
      input.request
    );
    return level;
  },
  delete: async (levelId: string) => {
    await apiClient.organizations.deleteLevel(levelId);
  },
};

export function useCreateOrganization({
  mutationConfig,
}: MutationHookOptions<typeof organizationMutations.create> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig ?? {};

  return useWrappedMutation(organizationMutations.create, {
    ...config,
    onSuccess: (organization, ...args) => {
      queryClient.setQueryData(
        organizationKeys.all,
        (
          old: Awaited<
            ReturnType<typeof apiClient.organizations.listOrganizations>
          >["organizations"]
        ) => [...old, organization]
      );
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
      onSuccess?.(organization, ...args);
    },
  });
}

export function useUpdateOrganization({
  mutationConfig,
}: MutationHookOptions<typeof organizationMutations.update> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(organizationMutations.update, {
    ...config,
    onSuccess: (organization, ...args) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.byId(organization.id),
      });
      onSuccess?.(organization, ...args);
    },
  });
}

export function useCreateLevel({
  mutationConfig,
}: MutationHookOptions<typeof levelMutations.create> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(levelMutations.create, {
    ...config,
    onSuccess: (level, ...args) => {
      queryClient.setQueryData(
        organizationKeys.listLevels(),
        (
          old: Awaited<
            ReturnType<typeof apiClient.organizations.listLevels>
          >["levels"]
        ) => [...old, level]
      );
      queryClient.invalidateQueries({
        queryKey: organizationKeys.listLevels(),
      });
      onSuccess?.(level, ...args);
    },
  });
}

export function useUpdateLevel({
  mutationConfig,
}: MutationHookOptions<typeof levelMutations.update> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(levelMutations.update, {
    ...config,
    onSuccess: (level, ...args) => {
      queryClient.setQueryData(organizationKeys.levelById(level.id), level);
      queryClient.invalidateQueries({
        queryKey: organizationKeys.levelById(level.id),
      });
      onSuccess?.(level, ...args);
    },
  });
}

export function useDeleteLevel({
  mutationConfig,
}: MutationHookOptions<typeof levelMutations.delete> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(levelMutations.delete, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.listLevels(),
      });
      onSuccess?.(...args);
    },
  });
}
