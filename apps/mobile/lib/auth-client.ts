import { expoClient } from "@better-auth/expo";
import * as SecureStore from "expo-secure-store";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";

const ORGANIZATION_SLUG =
  process.env.EXPO_PUBLIC_ORGANIZATION_SLUG ?? "instride";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000",
  basePath: "/auth",
  plugins: [
    expoClient({
      scheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? ORGANIZATION_SLUG,
      storagePrefix: ORGANIZATION_SLUG,
      storage: SecureStore,
    }),
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
