import {
  mutationOptions,
  type UseMutationOptions,
  type QueryKey,
  queryOptions,
  useMutation,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { BetterFetchError, BetterFetchOption } from "better-auth/client";

// =============================================================================
// QUERIES
// =============================================================================

export type AuthFn<TData = unknown> = (params: {
  query?: Record<string, unknown>;
  fetchOptions?: BetterFetchOption;
}) => Promise<{ data: TData }>;

type AuthFnData<TFn> = TFn extends AuthFn<infer TData> ? TData : never;

export type AuthQueryParams<TFn extends (...args: any) => any> = NonNullable<
  Parameters<TFn>[0]
>;

export type AuthQueryHookOptions<TFn extends (...args: any) => Promise<any>> =
  Omit<
    UseQueryOptions<AuthFnData<TFn>, BetterFetchError>,
    "queryKey" | "queryFn"
  > &
    Partial<AuthQueryParams<TFn>>;

export function authQueryOptions<
  TFn extends AuthFn,
  const TQueryKey extends QueryKey,
>(authFn: TFn, queryKey: TQueryKey, params?: Parameters<TFn>[0]) {
  return queryOptions<AuthFnData<TFn>, BetterFetchError>({
    queryKey: [...queryKey, params?.query ?? null] as const,
    queryFn: ({ signal }) =>
      authFn({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true },
      }) as Promise<AuthFnData<TFn>>,
  });
}

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Extract the success data type from a Better Auth mutation method,
 * unwrapping `{ data: TData }` since `throw: true` gives bare `TData`.
 */
export type AuthMutationData<TFn extends (...args: any) => any> =
  Awaited<ReturnType<TFn>> extends { data: infer TData } ? TData : never;

/**
 * Extract the variables type (first param) from a Better Auth mutation method.
 */
export type AuthMutationVariables<TFn extends (...args: any) => any> =
  Parameters<TFn>[0];

/**
 * React Query options for a Better Auth mutation, minus the `mutationFn`
 * which the wrapper supplies.
 */
export type AuthMutationConfig<TData, TVariables> = Omit<
  UseMutationOptions<TData, BetterFetchError, TVariables>,
  "mutationFn"
>;

export type AuthMutationHookOptions<TData, TVariables> = {
  mutationConfig?: AuthMutationConfig<TData, TVariables>;
};

export type AuthMutationHookOptionsFor<
  TFn extends (...args: any) => Promise<any>,
> = AuthMutationHookOptions<AuthMutationData<TFn>, AuthMutationVariables<TFn>>;

export function authMutationOptions<TFn extends (...args: any) => Promise<any>>(
  authFn: TFn
) {
  type TData = AuthMutationData<TFn>;
  type TVariables = AuthMutationVariables<TFn>;

  return mutationOptions<TData, BetterFetchError, TVariables>({
    mutationFn: (variables) => {
      const v = variables as { fetchOptions?: BetterFetchOption } | undefined;
      return authFn({
        ...v,
        fetchOptions: { ...v?.fetchOptions, throw: true },
      } as Parameters<TFn>[0]) as Promise<TData>;
    },
  });
}

export function useWrappedAuthMutation<
  TFn extends (...args: any) => Promise<any>,
  TContext = unknown,
>(
  authFn: TFn,
  options: Omit<
    UseMutationOptions<
      AuthMutationData<TFn>,
      BetterFetchError,
      AuthMutationVariables<TFn>,
      TContext
    >,
    "mutationFn"
  > = {}
) {
  return useMutation<
    AuthMutationData<TFn>,
    BetterFetchError,
    AuthMutationVariables<TFn>,
    TContext
  >({
    ...options,
    mutationFn: (variables) => {
      const v = variables as { fetchOptions?: BetterFetchOption } | undefined;
      return authFn({
        ...v,
        fetchOptions: { ...v?.fetchOptions, throw: true },
      } as Parameters<TFn>[0]) as Promise<AuthMutationData<TFn>>;
    },
  });
}
