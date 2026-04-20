import type { Cookie, Header } from "encore.dev/api";
import { APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

import { auth } from "./auth";
import { Session } from "./types/models";

export interface AuthParams {
  sessionToken?: Cookie<"better-auth.session_token">;
  host: Header<"Host">;
}

export interface AuthData {
  userID: string;
  session: Session;
  token: string;
  organizationId?: string | null | undefined;
}

const handler = authHandler<AuthParams, AuthData>(async (params) => {
  if (!params.sessionToken?.value) {
    throw APIError.unauthenticated("no session cookie");
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: `better-auth.session_token=${params.sessionToken.value}`,
    }),
  });

  if (!session) {
    throw APIError.unauthenticated("invalid session");
  }

  return {
    userID: session.user.id,
    organizationId: session.session.contextOrganizationId,
    session,
    token: params.sessionToken.value,
  };
});

export const gateway = new Gateway({ authHandler: handler });
