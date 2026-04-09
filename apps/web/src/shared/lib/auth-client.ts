import { serverBaseURL } from "@instride/server-client";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: serverBaseURL,
  basePath: "/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    organizationClient({
      schema: {
        organization: {
          modelName: "authOrganizations",
          additionalFields: {
            slug: { type: "string", required: true, unique: true },
            timezone: { type: "string", required: true, default: "UTC" },
          },
        },
      },
    }),
    inferAdditionalFields({
      session: {
        contextOrganizationId: {
          type: "string",
          required: false,
        },
      },
      user: {
        phone: {
          type: "string",
          required: false,
        },
        profilePictureUrl: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

export type AuthUser = typeof authClient.$Infer.Session.user;
export type AuthSession = typeof authClient.$Infer.Session;
