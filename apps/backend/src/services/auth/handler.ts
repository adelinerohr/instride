import type { Cookie, Header } from "encore.dev/api";
import { APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

import { auth } from "./auth";
import { Session } from "./types/models";

export interface AuthParams {
  sessionToken?: Cookie<"better-auth.session_token">;
  secureSessionToken?: Cookie<"__Secure-better-auth.session_token">;
  sessionData?: Cookie<"better-auth.session_data">;
  secureSessionData?: Cookie<"__Secure-better-auth.session_data">;
  host: Header<"Host">;
}

export interface AuthData {
  userID: string;
  session: Session;
  token: string;
  organizationId?: string | null | undefined;
}

const handler = authHandler<AuthParams, AuthData>(async (params) => {
  const token =
    params.secureSessionToken?.value ?? params.sessionToken?.value ?? undefined;

  if (!token) {
    throw APIError.unauthenticated("no session cookie");
  }

  // Build a cookie header containing both the token cookie and the cache cookie
  // so Better Auth can hit its fast path
  const cookieParts: string[] = [];

  if (params.secureSessionToken?.value) {
    cookieParts.push(
      `__Secure-better-auth.session_token=${params.secureSessionToken.value}`
    );
  } else if (params.sessionToken?.value) {
    cookieParts.push(`better-auth.session_token=${params.sessionToken.value}`);
  }

  if (params.secureSessionData?.value) {
    cookieParts.push(
      `__Secure-better-auth.session_data=${params.secureSessionData.value}`
    );
  } else if (params.sessionData?.value) {
    cookieParts.push(`better-auth.session_data=${params.sessionData.value}`);
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: cookieParts.join("; "),
    }),
  });

  if (!session) {
    throw APIError.unauthenticated("invalid session");
  }

  return {
    userID: session.user.id,
    organizationId: session.session.contextOrganizationId,
    session,
    token,
  };
});

export const gateway = new Gateway({ authHandler: handler });
