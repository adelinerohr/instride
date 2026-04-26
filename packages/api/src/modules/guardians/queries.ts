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
      queryFn: async () =>
        await apiClient.guardians.getRelationshipById(relationshipId),
    }),

  myGuardian: () =>
    queryOptions({
      queryKey: guardianKeys.myGuardian(),
      queryFn: async () => await apiClient.guardians.listMyGuardians(),
    }),

  myDependents: () =>
    queryOptions({
      queryKey: guardianKeys.myDependents(),
      queryFn: async () => {
        const { relationships } = await apiClient.guardians.listMyDependents();
        return relationships;
      },
    }),

  pendingInvitation: () =>
    queryOptions({
      queryKey: guardianKeys.pendingInvitation(),
      queryFn: async () => {
        const { invitation } = await apiClient.guardians.getPendingInvitation();
        return invitation;
      },
    }),
  invitationByToken: (token: string) =>
    queryOptions({
      queryKey: guardianKeys.invitationByToken(token),
      queryFn: async () =>
        await apiClient.guardians.getInvitationByToken(token),
    }),
};

// ---- Hooks --------------------------------------------------------------------

export const useGuardians = () => {
  return useQuery(guardianOptions.list());
};

export const useGuardianById = (relationshipId: string) => {
  return useQuery(guardianOptions.byId(relationshipId));
};

export const useMyGuardian = () => {
  return useQuery(guardianOptions.myGuardian());
};

export const useMyDependents = () => {
  return useQuery(guardianOptions.myDependents());
};

export const usePendingInvitation = () => {
  return useQuery(guardianOptions.pendingInvitation());
};

export const useInvitationByToken = (token: string) => {
  return useQuery(guardianOptions.invitationByToken(token));
};
