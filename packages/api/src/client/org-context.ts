/**
 * Module-level store for the active organization context. The API client
 * reads this when attaching the `X-Organization-Id` header to every
 * outbound request, so the backend can resolve the active org without
 * relying on session-persisted state.
 */
let currentOrganizationId: string | null = null;

export function setOrganizationContext(organizationId: string | null): void {
  currentOrganizationId = organizationId;
}

export function getOrganizationContext(): string | null {
  return currentOrganizationId;
}
