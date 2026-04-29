import { linkOptions } from "@tanstack/react-router";

import { applyOrgPathOutputRewrite } from "./subdomain-rewrite";

/**
 * Full page navigation to an app-internal path after sign-in / sign-up.
 * Avoids stale TanStack Router context and React Query cache (session appears
 * only after reload otherwise in some flows).
 *
 * In production on org subdomains, rewrites `/org/{slug}/…` to the canonical
 * browser URL (see `applyOrgPathOutputRewrite`, used by the router in `main.tsx`).
 */
export function hardNavigateToInternalPath(
  path: string,
  fallback: string
): void {
  const safe = path.startsWith("/") && !path.startsWith("//") ? path : fallback;
  const url = new URL(safe, window.location.href);
  if (import.meta.env.PROD) {
    applyOrgPathOutputRewrite(url);
  }
  window.location.assign(url.href);
}

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

export const getConversationLink = (
  orgSlug: string,
  conversationId: string,
  isPortal: boolean
) => {
  if (isPortal) {
    return linkOptions({
      to: "/org/$slug/portal/messages/$conversationId",
      params: { slug: orgSlug, conversationId },
    });
  }
  return linkOptions({
    to: "/org/$slug/admin/messages/$conversationId",
    params: { slug: orgSlug, conversationId },
  });
};
