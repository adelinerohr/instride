import { queryOptions, useQuery } from "@tanstack/react-query";

import { STALE } from "#_internal";
import { apiClient } from "#client";

import { organizationKeys } from "./keys";

// ---- Query options ------------------------------------------------------------

export const organizationOptions = {
  all: () =>
    queryOptions({
      queryKey: organizationKeys.all,
      queryFn: async () => {
        const { organizations } =
          await apiClient.organizations.listOrganizations();
        return organizations;
      },
      staleTime: STALE.MINUTES.FIVE,
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
