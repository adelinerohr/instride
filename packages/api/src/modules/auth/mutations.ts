import { useQueryClient } from "@tanstack/react-query";

import type { MutationHookOptions } from "#_internal";
import { mutation } from "#_internal/wrappers";
import { apiClient, type auth } from "#client";

import { authKeys } from "./keys";

export const authMutations = {
  updateCurrentUser: async (request: auth.UpdateUserRequest) => {
    await apiClient.auth.updateUser(request);
  },
};

export function useUpdateCurrentUser({
  mutationConfig,
}: MutationHookOptions<typeof authMutations.updateCurrentUser> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.base(authMutations.updateCurrentUser, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      onSuccess?.(...args);
    },
  });
}
