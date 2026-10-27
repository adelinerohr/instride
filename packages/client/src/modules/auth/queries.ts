import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

import { apiClient, auth, authClient, type AuthClient } from "#client";

import { adminKeys, authKeys } from "./keys";
import { authQueryOptions, type AuthQueryHookOptions } from "./utils";

export const authOptions = {
  session: (params?: Parameters<AuthClient["getSession"]>[0]) =>
    authQueryOptions(authClient.getSession, authKeys.session, params),
  listAccounts: (
    userId?: string,
    params?: Parameters<AuthClient["listAccounts"]>[0]
  ) =>
    authQueryOptions(
      authClient.listAccounts,
      authKeys.listAccounts(userId),
      params
    ),
};

export const adminOptions = {
  users: (params: auth.ListUsersParams) =>
    queryOptions({
      queryKey: adminKeys.users(params),
      queryFn: async () => await apiClient.auth.listUsers(params),
      placeholderData: (prev) => prev,
    }),
};

export function useListUsers(params: auth.ListUsersParams) {
  return useQuery(adminOptions.users(params));
}

export function useSession(
  options?: AuthQueryHookOptions<typeof authClient.getSession>
) {
  const { query, fetchOptions, ...queryOptions } = options ?? {};

  return useQuery({
    ...authOptions.session({ query, fetchOptions }),
    ...queryOptions,
  });
}

export function useListAccounts(
  options?: AuthQueryHookOptions<typeof authClient.listAccounts>
) {
  const { data: session } = useSession({ refetchOnMount: false });
  const userId = session?.user.id;
  const disabled = !userId;

  const { fetchOptions, ...queryOptions } = options ?? {};

  return useQuery({
    ...authOptions.listAccounts(userId, { fetchOptions }),
    ...(disabled && { queryFn: skipToken }),
    ...queryOptions,
  });
}

export function useUser() {
  const { data, ...rest } = useSession();

  return {
    data: data?.user,
    ...rest,
  };
}
