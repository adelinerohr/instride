import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization, testUtils } from "better-auth/plugins";
import { appMeta } from "encore.dev";
import { secret } from "encore.dev/config";

import { db } from "../../database";
import {
  ac,
  admin as adminRole,
  trainer,
  rider,
  guardian,
} from "./permissions";

const authSecret = secret("AuthSecret");
const googleClientId = secret("GoogleClientId");
const googleClientSecret = secret("GoogleClientSecret");
const baseURL = appMeta().apiBaseUrl;
const isProd = appMeta().environment.type === "production";

export const auth = betterAuth({
  /** Configuration */
  basePath: "/auth",
  baseURL,
  secret: authSecret(),

  trustedOrigins: isProd
    ? [
        "https://app.instrideapp.com",
        "https://instrideapp.com",
        "https://*.instrideapp.com",
      ]
    : [
        "http://localhost:4000",
        "http://127.0.0.1:4000",
        "http://localhost:3000",
        "http://127.0.0.1:3000", // Add this
      ],

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  /** Authentication providers */
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("─────────────────────────────────────");
        console.log("📧 Reset password");
        console.log(`To: ${user.email}`);
        console.log(`URL: ${url}`);
        console.log("─────────────────────────────────────");
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("─────────────────────────────────────");
        console.log("📧 Email verification");
        console.log(`To: ${user.email}`);
        console.log(`URL: ${url}`);
        console.log("─────────────────────────────────────");
      }
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: googleClientId(),
      clientSecret: googleClientSecret(),
      scope: ["email", "profile"],
    },
  },

  /** Plugins */
  plugins: [
    expo(),
    admin(),
    organization({
      sendInvitationEmail: async ({ email, inviter, id, organization }) => {
        const existingUser = await db.query.authUsers.findFirst({
          where: {
            id: inviter.userId,
          },
        });

        const url = new URL(
          existingUser
            ? `/org/${organization.slug}/login`
            : `/org/${organization.slug}/register`
        );

        url.searchParams.set("invitationId", id);
        url.searchParams.set("email", email);

        if (process.env.NODE_ENV === "development") {
          console.log("─────────────────────────────────────");
          console.log("📧 Invitation");
          console.log(`To: ${email}`);
          console.log(`Invited by: ${existingUser?.name}`);
          console.log(`URL: ${url.toString()}`);
          console.log("─────────────────────────────────────");
        }
      },
      ac,
      roles: {
        admin: adminRole,
        trainer,
        rider,
        guardian,
      },
      schema: {
        organization: {
          modelName: "authOrganizations",
          additionalFields: {
            slug: { type: "string", required: true, unique: true },
            timezone: { type: "string", required: true, default: "UTC" },
          },
        },
        member: {
          modelName: "authMembers",
        },
        invitation: {
          modelName: "authInvitations",
        },
      },
    }),
    openAPI(),
    testUtils(),
  ],

  /** Models */
  session: {
    modelName: "authSessions",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },

    ...(isProd && {
      cookieAttributes: {
        domain: ".instrideapp.com",
        sameSite: "lax",
        secure: true,
        httpOnly: true,
      },
    }),

    additionalFields: {
      contextOrganizationId: { type: "string", required: false },
    },
  },
  user: {
    modelName: "authUsers",
    additionalFields: {
      phone: { type: "string", required: false },
      profilePictureUrl: { type: "string", required: false },
    },
  },
  account: {
    modelName: "authAccounts",
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    },
  },
  verification: {
    modelName: "authVerifications",
  },
});
