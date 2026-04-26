import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import {
  apiClient,
  auth,
  authClient,
  clearOrganizationContext,
  upload,
} from "#client";

import { authKeys } from "./keys";
import {
  useWrappedAuthMutation,
  type AuthMutationHookOptionsFor,
} from "./utils";

export const authMutations = {
  uploadAvatar: async (params: upload.UploadAvatarParams) =>
    await apiClient.upload.uploadAvatar(params),
  deleteAvatar: async (params: upload.DeleteAvatarParams) =>
    await apiClient.upload.deleteAvatar(params),
};

export const adminMutations = {
  exportUsers: async (params: auth.ExportUsersParams) =>
    await apiClient.auth.exportUsers(params),
};

export function useUploadAvatar({
  mutationConfig,
}: MutationHookOptions<typeof authMutations.uploadAvatar> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(authMutations.uploadAvatar, {
    ...config,
    onSuccess: (response, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.user(variables.userId),
      });
      onSuccess?.(response, variables, ...args);
    },
  });
}

export function useDeleteAvatar({
  mutationConfig,
}: MutationHookOptions<typeof authMutations.deleteAvatar> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(authMutations.deleteAvatar, {
    ...config,
    onSuccess: (response, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.user(variables.userId),
      });
      onSuccess?.(response, variables, ...args);
    },
  });
}

export function useExportUsers({
  mutationConfig,
}: MutationHookOptions<typeof adminMutations.exportUsers> = {}) {
  const config = mutationConfig || {};

  return useWrappedMutation(adminMutations.exportUsers, config);
}

// ------------------------------------------------------------
// Better Auth Mutations
// ------------------------------------------------------------

export function useRequestPasswordReset({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.requestPasswordReset> = {}) {
  return useWrappedAuthMutation(
    authClient.requestPasswordReset,
    mutationConfig
  );
}

export function useResetPassword({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.resetPassword> = {}) {
  return useWrappedAuthMutation(authClient.resetPassword, mutationConfig);
}

export function useSendVerificationEmail({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.sendVerificationEmail> = {}) {
  return useWrappedAuthMutation(
    authClient.sendVerificationEmail,
    mutationConfig
  );
}

export function useUpdateUser({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.updateUser> = {}) {
  return useWrappedAuthMutation(authClient.updateUser, mutationConfig);
}

export function useChangeEmail({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.changeEmail> = {}) {
  return useWrappedAuthMutation(authClient.changeEmail, mutationConfig);
}

export function useChangePassword({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.changePassword> = {}) {
  return useWrappedAuthMutation(authClient.changePassword, mutationConfig);
}

export function useSignOut({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.signOut> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedAuthMutation(authClient.signOut, {
    ...config,
    onSuccess: (result, ...args) => {
      clearOrganizationContext();
      queryClient.clear();
      onSuccess?.(result, ...args);
    },
  });
}

export function useSignUpEmail({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.signUp.email> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedAuthMutation(authClient.signUp.email, {
    ...config,
    onSuccess: (result, ...args) => {
      clearOrganizationContext();
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      onSuccess?.(result, ...args);
    },
  });
}

export function useSignInEmail({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.signIn.email> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedAuthMutation(authClient.signIn.email, {
    ...config,
    onSuccess: (result, ...args) => {
      clearOrganizationContext();
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      onSuccess?.(result, ...args);
    },
  });
}

export function useSignInSocial({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.signIn.social> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedAuthMutation(authClient.signIn.social, {
    ...config,
    onSuccess: (result, ...args) => {
      clearOrganizationContext();
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      onSuccess?.(result, ...args);
    },
  });
}
