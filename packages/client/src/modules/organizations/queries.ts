import { queryOptions, useQuery } from "@tanstack/react-query";

import { STALE } from "#_internal";
import { apiClient } from "#client";

import { organizationKeys } from "./keys";

// ---- Query options ------------------------------------------------------------

export const organizationOptions = {
  all: () =>
    queryOptions({
      queryKey: organizationKeys.all(),
      queryFn: async () => {
        const { organizations } =
          await apiClient.organizations.listOrganizations();
        return organizations;
      },
      staleTime: STALE.MINUTES.FIVE,
    }),
  listByUser: (userId: string) =>
    queryOptions({
      queryKey: organizationKeys.listByUser(userId),
      queryFn: async () => {
        const { organizations } =
          await apiClient.organizations.listMyOrganizations();
        return organizations;
      },
    }),
  bySlug: (slug: string) =>
    queryOptions({
      queryKey: organizationKeys.bySlug(slug),
      queryFn: async () => {
        const { organization } = await apiClient.organizations.getBySlug(slug);
        return organization;
      },
      staleTime: STALE.MINUTES.FIVE,
    }),
  byId: (id: string) =>
    queryOptions({
      queryKey: organizationKeys.byId(id),
      queryFn: async () => {
        const { organization } = await apiClient.organizations.getById(id);
        return organization;
      },
      staleTime: STALE.MINUTES.FIVE,
    }),
  checkSlug: (slug: string) =>
    queryOptions({
      queryKey: organizationKeys.checkSlug(slug),
      queryFn: async () => {
        return await apiClient.organizations.checkSlug(slug);
      },
      staleTime: STALE.SECONDS.THIRTY,
    }),
};

export const invitationOptions = {
  list: (organizationId: string) =>
    queryOptions({
      queryKey: organizationKeys.listInvitations(),
      queryFn: async () => {
        const { invitations } =
          await apiClient.organizations.listInvitations(organizationId);
        return invitations;
      },
    }),
  listUser: () =>
    queryOptions({
      queryKey: organizationKeys.listUserInvitations(),
      queryFn: async () => {
        const { invitations } =
          await apiClient.organizations.listUserInvitations();
        return invitations;
      },
    }),
  byId: (id: string) =>
    queryOptions({
      queryKey: organizationKeys.invitationById(id),
      queryFn: async () => {
        const { invitation } = await apiClient.organizations.getInvitation(id);
        return invitation;
      },
    }),
  roles: (organizationId: string) =>
    queryOptions({
      queryKey: organizationKeys.invitationRoles(),
      queryFn: async () => {
        const { roles } =
          await apiClient.organizations.listMyInvitedRoles(organizationId);
        return roles;
      },
    }),
};

export const levelOptions = {
  list: () =>
    queryOptions({
      queryKey: organizationKeys.listLevels(),
      queryFn: async () => {
        const { levels } = await apiClient.organizations.listLevels();
        return levels;
      },
    }),
  byId: (levelId: string) =>
    queryOptions({
      queryKey: organizationKeys.levelById(levelId),
      queryFn: async () => {
        const { level } = await apiClient.organizations.getLevel(levelId);
        return level;
      },
    }),
};

// ---- Hooks --------------------------------------------------------------------

export function useOrganizations() {
  return useQuery(organizationOptions.all());
}

export function useListMyOrganizations(userId: string) {
  return useQuery(organizationOptions.listByUser(userId));
}

export function useOrganizationBySlug(slug: string) {
  return useQuery(organizationOptions.bySlug(slug));
}

export function useOrganizationById(id: string) {
  return useQuery(organizationOptions.byId(id));
}

export function useCheckSlug(slug: string) {
  return useQuery(organizationOptions.checkSlug(slug));
}

export function useLevels() {
  return useQuery(levelOptions.list());
}

export function useLevelById(levelId: string) {
  return useQuery(levelOptions.byId(levelId));
}
