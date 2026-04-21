import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization, testUtils } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { appMeta } from "encore.dev";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";
import { Pool } from "pg";

import { DB } from "@/database";
import * as schema from "@/database/schema";

import { invitationEmail } from "../email/templates/invitation";
import { passwordResetEmail } from "../email/templates/password-reset";
import { verificationEmail } from "../email/templates/verification";
import { sendEmailTopic } from "../email/topic";
import { db } from "./db";
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
const isProd = appMeta().environment.type === "production";

const baseURL = isProd
  ? "https://api.instrideapp.com"
  : "http://localhost:4000";

const pool = new Pool({
  connectionString: DB.connectionString,
});

const authDb = drizzle({ client: pool, schema });

export const auth = betterAuth({
  /** Configuration */
  basePath: "/auth",
  baseURL,
  secret: authSecret(),
  database: drizzleAdapter(authDb, {
    provider: "pg",
  }),
  logger: {
    disableColors: true,
    level: "warn",
    log: (level, message, ...args) => {
      log.warn("better-auth", { level, message, args: JSON.stringify(args) });
    },
  },

  ...(isProd && {
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: ".instrideapp.com",
      },
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
  }),

  trustedOrigins: isProd
    ? [
        // Custom domain (when ready)
        "https://app.instrideapp.com",
        "https://api.instrideapp.com",
        "https://instrideapp.com",
        "https://*.instrideapp.com",

        // Vercel domain (for testing)
        "https://instride.vercel.app",
        "https://*.instride.vercel.app",
      ]
    : [
        "http://localhost:4000",
        "http://127.0.0.1:4000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],

  /** Authentication providers */
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const html = passwordResetEmail({
        userName: user.name,
        resetUrl: url,
      });

      await sendEmailTopic.publish({
        to: user.email,
        subject: "Reset your password",
        html,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const html = verificationEmail({
        userName: user.name,
        verificationUrl: url,
      });

      await sendEmailTopic.publish({
        to: user.email,
        subject: "Verify your email address",
        html,
      });
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
            : `/org/${organization.slug}/register`,
          "https://api.instrideapp.com"
        );

        url.searchParams.set("invitationId", id);
        url.searchParams.set("email", email);

        const html = invitationEmail({
          invitedByName: existingUser?.name || "Someone",
          organizationName: organization.name,
          invitationUrl: url.toString(),
          isExistingUser: !!existingUser,
        });

        await sendEmailTopic.publish({
          to: email,
          subject: `You've been invited to ${organization.name}`,
          html,
        });
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
            imageKey: { type: "string", required: false },
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

    additionalFields: {
      contextOrganizationId: { type: "string", required: false },
    },
  },
  user: {
    modelName: "authUsers",
    additionalFields: {
      phone: { type: "string", required: false },
      profilePictureUrl: { type: "string", required: false },
      dateOfBirth: { type: "string", required: false },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
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
