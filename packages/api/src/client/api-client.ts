import Client, { Local, type BaseURL, type Fetcher } from "./encore-client";
import { getOrganizationContext } from "./org-context";

function getServerBaseURL(): BaseURL {
  const isProduction = process.env.NODE_ENV === "production";

  return isProduction ? "https://api.instrideapp.com" : Local;
}

export const serverBaseURL = getServerBaseURL();

const ORG_CONTEXT_HEADER = "X-Organization-Id";

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
