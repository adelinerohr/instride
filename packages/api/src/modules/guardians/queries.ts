import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { guardianKeys } from "./keys";

// ---- Query Options ------------------------------------------------------------

export const guardianOptions = {
  list: () =>
    queryOptions({
      queryKey: guardianKeys.all(),
      queryFn: async () => {
        const { relationships } =
          await apiClient.guardians.listAllRelationships();
        return relationships;
      },
    }),

  byId: (relationshipId: string) =>
    queryOptions({
      queryKey: guardianKeys.relationship(relationshipId),
      queryFn: async () => {
        const { relationship } =
          await apiClient.guardians.getRelationshipById(relationshipId);
        return relationship;
      },
    }),

  byGuardian: (guardianMemberId: string) =>
    queryOptions({
      queryKey: guardianKeys.byGuardian(guardianMemberId),
      queryFn: async () => {
        const { relationships } =
          await apiClient.guardians.getGuardianRelationships(guardianMemberId);
        return relationships;
      },
    }),

  myGuardians: () =>
    queryOptions({
      queryKey: guardianKeys.myGuardians(),
      queryFn: async () => {
        const { relationships } = await apiClient.guardians.getMyGuardians();
        return relationships;
      },
    }),

  myDependents: () =>
    queryOptions({
      queryKey: guardianKeys.myDependents(),
      queryFn: async () => {
        const { relationships } = await apiClient.guardians.getMyDependents();
        return relationships;
      },
    }),

  pending: () =>
    queryOptions({
      queryKey: guardianKeys.pending(),
      queryFn: async () => {
        const { relationships } =
          await apiClient.guardians.listPendingGuardianRequests();
        return relationships;
      },
    }),
};

// ---- Hooks --------------------------------------------------------------------

export const useGuardians = () => {
  return useQuery(guardianOptions.list());
};

export const useGuardianById = (relationshipId: string) => {
  return useQuery(guardianOptions.byId(relationshipId));
};

export const useGuardianByGuardian = (guardianMemberId: string) => {
  return useQuery(guardianOptions.byGuardian(guardianMemberId));
};

export const useMyGuardians = () => {
  return useQuery(guardianOptions.myGuardians());
};

export const useMyDependents = () => {
  return useQuery(guardianOptions.myDependents());
};

export const usePending = () => {
  return useQuery(guardianOptions.pending());
};
