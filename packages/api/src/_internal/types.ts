import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import type { APIError } from "#client";

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  APIError,
  Parameters<MutationFnType>[0]
>;

export type MutationHookOptions<
  MutationFnType extends (...args: any) => Promise<any>,
> = {
  mutationConfig?: MutationConfig<MutationFnType>;
};

type MutationFn = (variables: any) => Promise<any>;

type MutationData<TMutationFn extends MutationFn> = Awaited<
  ReturnType<TMutationFn>
>;

type MutationVariables<TMutationFn extends MutationFn> =
  Parameters<TMutationFn>[0];

type OrganizationMutationVariables<TMutationFn extends MutationFn> = Omit<
  MutationVariables<TMutationFn>,
  "organizationId"
>;

export type OrganizationMutationHookOptions<TMutationFn extends MutationFn> = {
  mutationConfig?: Omit<
    UseMutationOptions<
      MutationData<TMutationFn>,
      APIError,
      OrganizationMutationVariables<TMutationFn>
    >,
    "mutationFn"
  >;
};

export function useWrappedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: Omit<UseMutationOptions<TData, APIError, TVariables>, "mutationFn">
) {
  return useMutation<TData, APIError, TVariables>({
    ...options,
    mutationFn,
  });
}
