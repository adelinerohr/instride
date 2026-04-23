import { linkOptions } from "@tanstack/react-router";

export const getLoginLink = (orgSlug?: string) => {
  if (orgSlug) {
    return linkOptions({
      to: "/org/$slug/auth/login",
      params: { slug: orgSlug },
    });
  }
  return linkOptions({
    to: "/auth/login",
  });
};

export const getRegisterLink = (orgSlug?: string) => {
  if (orgSlug) {
    return linkOptions({
      to: "/org/$slug/auth/register",
      params: { slug: orgSlug },
    });
  }
  return linkOptions({
    to: "/auth/register",
  });
};

export const getRootLink = (orgSlug?: string) => {
  if (orgSlug) {
    return linkOptions({
      to: "/org/$slug",
      params: { slug: orgSlug },
    });
  }
  return linkOptions({
    to: "/",
  });
};

export const getPortalDashboardLink = (orgSlug: string) =>
  linkOptions({
    to: "/org/$slug/portal",
    params: { slug: orgSlug },
  });

export const getAdminDashboardLink = (orgSlug: string) =>
  linkOptions({
    to: "/org/$slug/admin",
    params: { slug: orgSlug },
  });

export const getDashboardLink = (orgSlug: string, isAdmin: boolean) => {
  if (isAdmin) {
    return getAdminDashboardLink(orgSlug);
  }
  return getPortalDashboardLink(orgSlug);
};
