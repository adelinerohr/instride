/**
 * Typed oRPC client for web and native.
 *
 * Only the router TYPE is imported from the server code, so bundlers never
 * pull drizzle, better-auth or any handler code into the app.
 *
 * One client per organization: the X-Organization-Id header is baked in and
 * every query key is prefixed with ["org", organizationId], so two orgs can
 * never share a cache entry. Switching orgs = creating a new client (memoize
 * it on the org id in your provider). No global mutable org variable, no
 * cancel-and-clear dance on switch.
 */
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { ORGANIZATION_HEADER } from "./constants";
import type { AppRouterClient } from "./routers/index";

type HeaderMap = Record<string, string | undefined>;

export interface ApiClientOptions {
  /** Server origin, e.g. "https://api.instrideapp.com" (no trailing /rpc). */
  baseUrl: string;
  /** Omit for calls outside an org (organizations.mine, invitations.accept, ...). */
  organizationId?: string | null;
  /**
   * Extra headers per request. Native has no cookie jar, so pass
   * `() => ({ cookie: authClient.getCookie() })` from the Better Auth Expo client.
   */
  headers?: () => HeaderMap | Promise<HeaderMap>;
}

export function createApiClient(options: ApiClientOptions): AppRouterClient {
  const link = new RPCLink({
    url: `${options.baseUrl.replace(/\/$/, "")}/rpc`,
    fetch: (request, init) =>
      fetch(request, { ...init, credentials: "include" }),
    headers: async () => {
      const extra = (await options.headers?.()) ?? {};
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(extra)) {
        if (value) {
          headers[key] = value;
        }
      }
      if (options.organizationId) {
        headers[ORGANIZATION_HEADER] = options.organizationId;
      }
      return headers;
    },
  });

  return createORPCClient(link);
}

/** TanStack Query helpers: `api.members.list.queryOptions()`, `.mutationOptions()`, `.key()`. */
export function createApiUtils(options: ApiClientOptions) {
  const client = createApiClient(options);
  const path = options.organizationId
    ? ["org", options.organizationId]
    : ["global"];
  return createTanstackQueryUtils(client, { path });
}

export type ApiUtils = ReturnType<typeof createApiUtils>;
export type { AppRouterClient };
