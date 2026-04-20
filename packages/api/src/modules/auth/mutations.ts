import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, auth, authClient } from "#client";

import {
  useWrappedAuthMutation,
  type AuthMutationHookOptionsFor,
} from "./utils";

export const adminMutations = {
  exportUsers: async (params: auth.ExportUsersParams) =>
    await apiClient.auth.exportUsers(params),
};

export function useExportUsers({
  mutationConfig,
}: MutationHookOptions<typeof adminMutations.exportUsers> = {}) {
  const config = mutationConfig || {};

  return useWrappedMutation(adminMutations.exportUsers, config);
}

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
