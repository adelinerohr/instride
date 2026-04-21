import { appMeta } from "encore.dev";

export const SESSION_COOKIE_PLAIN = "better-auth.session_token" as const;
export const SESSION_COOKIE_SECURE =
  "__Secure-better-auth.session_token" as const;

export const SESSION_DATA_COOKIE_PLAIN = "better-auth.session_data" as const;
export const SESSION_DATA_COOKIE_SECURE =
  "__Secure-better-auth.session_data" as const;

const isProd = () => appMeta().environment.type === "production";

export function getSessionCookieName() {
  return isProd() ? SESSION_COOKIE_SECURE : SESSION_COOKIE_PLAIN;
}

export function getSessionDataCookieName() {
  return isProd() ? SESSION_DATA_COOKIE_SECURE : SESSION_DATA_COOKIE_PLAIN;
}

/**
 * Build a Cookie header that includes both the session token and the session
 * data (cache) cookie, so Better Auth can hit its cache path and skip the DB.
 */
export function buildSessionCookieHeader(
  token: string,
  sessionData?: string
): string {
  const parts = [`${getSessionCookieName()}=${token}`];
  if (sessionData) {
    parts.push(`${getSessionDataCookieName()}=${sessionData}`);
  }
  return parts.join("; ");
}
