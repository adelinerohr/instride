import type { Cookie, Header } from "encore.dev/api";
import { APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

import { auth } from "./auth";
import { buildSessionCookieHeader } from "./session-cookie";
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

  const sessionData =
    params.secureSessionData?.value ?? params.sessionData?.value ?? undefined;

  if (!token) {
    throw APIError.unauthenticated("no session cookie");
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: buildSessionCookieHeader(token, sessionData),
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
