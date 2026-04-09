import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import type { APIError } from "#client";

import { getOrganizationId } from "./runtime";

export const mutation = {
  base: useBaseMutation,
  organization: useOrganizationMutation,
};

export function useOrganizationMutation<
  TData,
  TVariables extends { organizationId: string },
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<
    UseMutationOptions<TData, APIError, Omit<TVariables, "organizationId">>,
    "mutationFn"
  >
) {
  const organizationId = getOrganizationId();

  return useMutation<TData, APIError, Omit<TVariables, "organizationId">>({
    ...options,
    mutationFn: (variables) =>
      mutationFn({ ...variables, organizationId } as TVariables),
  });
}

export function useBaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, APIError, TVariables>, "mutationFn">
) {
  return useMutation<TData, APIError, TVariables>({
    ...options,
    mutationFn,
  });
}
