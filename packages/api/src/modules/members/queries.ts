import { queryOptions, useQuery } from "@tanstack/react-query";

import { STALE } from "#_internal/constants";
import { apiClient } from "#client";

import { memberKeys } from "./keys";

// ---- Query options ------------------------------------------------------------

export const membersOptions = {
  all: () =>
    queryOptions({
      queryKey: memberKeys.list(),
      queryFn: async () => {
        const { members } = await apiClient.organizations.listMembers();
        return members;
      },
      staleTime: STALE.MINUTES.FIVE,
    }),
  me: () =>
    queryOptions({
      queryKey: memberKeys.me(),
      queryFn: async () => {
        const { member } = await apiClient.organizations.getMember();
        return member;
      },
    }),
  byId: (memberId: string) =>
    queryOptions({
      queryKey: memberKeys.byId(memberId),
      queryFn: async () => {
        const { member } =
          await apiClient.organizations.getMemberById(memberId);
        return member;
      },
    }),
  trainers: () =>
    queryOptions({
      queryKey: memberKeys.trainers(),
      queryFn: async () => {
        const { trainers } = await apiClient.organizations.listTrainers();
        return trainers;
      },
    }),
  riders: () =>
    queryOptions({
      queryKey: memberKeys.riders(),
      queryFn: async () => {
        const { riders } = await apiClient.organizations.listRiders();
        return riders;
      },
    }),
};

// ---- Hooks --------------------------------------------------------------------

export function useMembers() {
  return useQuery(membersOptions.all());
}

export function useMyMembership() {
  return useQuery(membersOptions.me());
}

export function useMember(memberId: string) {
  return useQuery(membersOptions.byId(memberId));
}

export function useTrainers() {
  return useQuery(membersOptions.trainers());
}

export function useRiders() {
  return useQuery(membersOptions.riders());
}
