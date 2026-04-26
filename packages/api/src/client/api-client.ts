import Client, { Local, type BaseURL, type Fetcher } from "./encore-client";
import { getOrganizationContext } from "./org-context";

function getServerBaseURL(): BaseURL {
  const isProduction = process.env.NODE_ENV === "production";

  return isProduction ? "https://api.instrideapp.com" : Local;
}

export const serverBaseURL = getServerBaseURL();

const ORG_CONTEXT_HEADER = "X-Organization-Id";

/**
 * Custom fetcher that attaches the active organization id as an
 * X-Organization-Id header on every request.
 *
 * IMPORTANT: `getOrganizationContext()` is called inside the fetcher, not
 * at module load. The value read here is the one in effect at the moment
 * the fetch is invoked — once the request leaves this function, the
 * browser has snapshotted the header and subsequent mutations to the
 * module-level variable cannot affect it. See `org-context.ts` for the
 * full race-safety model.
 */
const orgContextFetcher: Fetcher = (input, init) => {
  const organizationId = getOrganizationContext();
  if (!organizationId) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers);
  headers.set(ORG_CONTEXT_HEADER, organizationId);

  return fetch(input, { ...init, headers });
};

export const apiClient = new Client(serverBaseURL, {
  requestInit: {
    credentials: "include",
  },
  fetcher: orgContextFetcher,
});
