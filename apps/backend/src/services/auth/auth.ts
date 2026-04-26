import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { appMeta } from "encore.dev";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";
import { Pool } from "pg";
import { render } from "react-email";

import { DB } from "@/database";
import * as schema from "@/database/schema";
import { getBaseUrl } from "@/shared/utils/url";

import OrganizationInvitationEmail from "../email/templates/organization-invitation";
import PasswordResetEmail from "../email/templates/password-reset";
import VerifyEmailAddressEmail from "../email/templates/verify-email";
import { sendEmailTopic } from "../email/topic";
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

export const authDb = drizzle({ client: pool, schema });

export const auth = betterAuth({
  /** Configuration */
  basePath: "/auth",
  baseURL,
  secret: authSecret(),
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema,
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
      const component = PasswordResetEmail({
        appName: "Instride",
        name: user.name,
        resetPasswordLink: url,
      });

      const [html, text] = await Promise.all([
        render(component),
        render(component, { plainText: true }),
      ]);

      await sendEmailTopic.publish({
        to: user.email,
        subject: "Reset your password",
        html,
        text,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const component = VerifyEmailAddressEmail({
        name: user.name,
        verificationLink: url,
      });

      const [html, text] = await Promise.all([
        render(component),
        render(component, { plainText: true }),
      ]);

      await sendEmailTopic.publish({
        to: user.email,
        subject: "Verify your email address",
        html,
        text,
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
        const baseUrl = getBaseUrl({
          type: "web",
          organizationSlug: organization.slug,
        });

        const inviteLink = `${baseUrl}/invitation/${id}?type=organization&email=${encodeURIComponent(email)}`;

        const component = OrganizationInvitationEmail({
          appName: "Instride",
          invitedByName: inviter.user.name,
          invitedByEmail: inviter.user.email,
          organizationName: organization.name,
          inviteLink,
        });

        const [html, text] = await Promise.all([
          render(component),
          render(component, { plainText: true }),
        ]);

        await sendEmailTopic.publish({
          to: email,
          subject: `You've been invited to ${organization.name}`,
          html,
          text,
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
      trustedProviders: ["google", "credential"],
    },
  },
  verification: {
    modelName: "authVerifications",
  },
});
