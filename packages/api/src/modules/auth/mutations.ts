import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, auth, authClient, upload } from "#client";

import {
  useWrappedAuthMutation,
  type AuthMutationHookOptionsFor,
} from "./utils";

export const authMutations = {
  startUploadAvatar: async (params: upload.UploadAvatarParams) =>
    await apiClient.upload.uploadAvatar(params),
  confirmUploadAvatar: async (params: upload.ConfirmAvatarUploadParams) =>
    await apiClient.upload.confirmAvatarUpload(params),
  deleteUploadAvatar: async (params: upload.DeleteUserAvatarParams) =>
    await apiClient.upload.deleteUserAvatar(params),
};

export const adminMutations = {
  exportUsers: async (params: auth.ExportUsersParams) =>
    await apiClient.auth.exportUsers(params),
};

export function useStartUploadAvatar({
  mutationConfig,
}: MutationHookOptions<typeof authMutations.startUploadAvatar> = {}) {
  const config = mutationConfig || {};

  return useWrappedMutation(authMutations.startUploadAvatar, config);
}

export function useConfirmUploadAvatar({
  mutationConfig,
}: MutationHookOptions<typeof authMutations.confirmUploadAvatar> = {}) {
  const config = mutationConfig || {};

  return useWrappedMutation(authMutations.confirmUploadAvatar, config);
}

export function useDeleteUploadAvatar({
  mutationConfig,
}: MutationHookOptions<typeof authMutations.deleteUploadAvatar> = {}) {
  const config = mutationConfig || {};

  return useWrappedMutation(authMutations.deleteUploadAvatar, config);
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
      queryClient.clear();
      onSuccess?.(result, ...args);
    },
  });
}

export function useSignUpEmail({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.signUp.email> = {}) {
  return useWrappedAuthMutation(authClient.signUp.email, mutationConfig);
}

export function useSignInEmail({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.signIn.email> = {}) {
  return useWrappedAuthMutation(authClient.signIn.email, mutationConfig);
}

export function useSignInSocial({
  mutationConfig,
}: AuthMutationHookOptionsFor<typeof authClient.signIn.social> = {}) {
  return useWrappedAuthMutation(authClient.signIn.social, mutationConfig);
}
