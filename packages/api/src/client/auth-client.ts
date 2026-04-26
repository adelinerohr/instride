import {
  ac,
  admin as adminRole,
  trainer as trainerRole,
  rider as riderRole,
  guardian as guardianRole,
  userAdditionalFields,
  organizationAdditionalFields,
} from "@instride/auth";
import {
  adminClient,
  inferOrgAdditionalFields,
  organizationClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { AccessControl } from "better-auth/plugins/access";
import { createAuthClient } from "better-auth/react";

import { serverBaseURL } from "./api-client";

const _authClient = createAuthClient({
  baseURL: serverBaseURL,
  basePath: "/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: userAdditionalFields,
    }),
    organizationClient({
      schema: inferOrgAdditionalFields({
        organization: {
          additionalFields: organizationAdditionalFields,
        },
      }),
      ac: ac as unknown as AccessControl,
      roles: {
        admin: adminRole,
        trainer: trainerRole,
        rider: riderRole,
        guardian: guardianRole,
      },
    }),
  ],
});

export const authClient: typeof _authClient = _authClient;
export type AuthClient = typeof authClient;
