import { serverBaseURL } from "@instride/api";
import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
  memberAc,
} from "better-auth/plugins/organization/access";
import { createAuthClient } from "better-auth/react";

const accessControl = createAccessControl({
  ...defaultStatements,
});

export const authClient = createAuthClient({
  baseURL: serverBaseURL,
  basePath: "/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    adminClient(),
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
      ac: accessControl,
      roles: {
        owner: accessControl.newRole({
          ...ownerAc.statements,
        }),
        admin: accessControl.newRole({
          ...ownerAc.statements,
        }),
        trainer: accessControl.newRole({
          ...memberAc.statements,
        }),
        rider: accessControl.newRole({
          ...memberAc.statements,
        }),
        guardian: accessControl.newRole({
          ...memberAc.statements,
        }),
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
        dateOfBirth: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

export type AuthUser = typeof authClient.$Infer.Session.user;
export type AuthSession = typeof authClient.$Infer.Session;
