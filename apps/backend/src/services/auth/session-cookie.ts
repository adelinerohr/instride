import { appMeta } from "encore.dev";

export const SESSION_COOKIE_PLAIN = "better-auth.session_token" as const;
export const SESSION_COOKIE_SECURE =
  "__Secure-better-auth.session_token" as const;

/**
 * Better Auth uses the `__Secure-` cookie prefix on HTTPS (e.g. production).
 * Local HTTP uses the plain name.
 */
export function getSessionCookieName():
  | typeof SESSION_COOKIE_PLAIN
  | typeof SESSION_COOKIE_SECURE {
  return appMeta().environment.type === "production"
    ? SESSION_COOKIE_SECURE
    : SESSION_COOKIE_PLAIN;
}

/** Single `Cookie:` header value for `auth.api.*` calls that need the session. */
export function buildSessionCookieHeader(token: string): string {
  return `${getSessionCookieName()}=${token}`;
}
