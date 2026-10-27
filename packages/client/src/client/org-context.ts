/**
 * Module-level store for the active organization context. The API client
 * reads this when attaching the `X-Organization-Id` header to every
 * outbound request.
 *
 * RACE-SAFETY MODEL
 * -----------------
 * This is a single mutable variable shared by every call site in the tab.
 * That sounds dangerous but is fine in practice IF the following invariants
 * hold:
 *
 *   1. The fetcher reads `currentOrganizationId` at the moment `fetch` is
 *      invoked, not when the request was scheduled. A request that started
 *      before a context switch carries the *old* org id; one that fires
 *      after carries the new one. The browser then snapshots that header
 *      onto the wire — no further mutation can affect it.
 *
 *   2. Before switching contexts, callers cancel all in-flight TanStack
 *      Query requests and clear the org-scoped portion of the cache. This
 *      is the responsibility of the route loader that performs the switch
 *      (see `routes/org/$slug.tsx`). Otherwise a late response from org-A
 *      could populate the cache after we've already moved to org-B.
 *
 *   3. The context is cleared on sign-in and sign-out, so authenticated
 *      requests can never carry an org id from a previous user's session.
 *
 * Each browser tab has its own JS module instance, so there is no
 * cross-tab interference — opening org-B in a new tab does not affect
 * org-A in the original tab.
 */
let currentOrganizationId: string | null = null;

export function setOrganizationContext(organizationId: string | null): void {
  currentOrganizationId = organizationId;
}

export function getOrganizationContext(): string | null {
  return currentOrganizationId;
}

export function clearOrganizationContext(): void {
  currentOrganizationId = null;
}
