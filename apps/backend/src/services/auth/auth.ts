import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization, testUtils } from "better-auth/plugins";
import { appMeta } from "encore.dev";
import { secret } from "encore.dev/config";

import { db } from "../../database";
import { invitationEmail } from "../email/templates/invitation";
import { passwordResetEmail } from "../email/templates/password-reset";
import { verificationEmail } from "../email/templates/verification";
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
const baseURL = appMeta().apiBaseUrl;
const isProd = appMeta().environment.type === "production";

export const auth = betterAuth({
  /** Configuration */
  basePath: "/auth",
  baseURL: isProd ? baseURL : "http://localhost:4000",
  secret: authSecret(),

  trustedOrigins: isProd
    ? [
        // Custom domain (when ready)
        "https://app.instrideapp.com",
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

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  /** Authentication providers */
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!isProd) {
        console.log("─────────────────────────────────────");
        console.log("📧 Reset password");
        console.log(`To: ${user.email}`);
        console.log(`URL: ${url}`);
        console.log("─────────────────────────────────────");
      } else {
        const html = passwordResetEmail({
          userName: user.name,
          resetUrl: url,
        });

        await sendEmailTopic.publish({
          to: user.email,
          subject: "Reset your password",
          html,
        });
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!isProd) {
        console.log("─────────────────────────────────────");
        console.log("📧 Email verification");
        console.log(`To: ${user.email}`);
        console.log(`URL: ${url}`);
        console.log("─────────────────────────────────────");
      } else {
        const html = verificationEmail({
          userName: user.name,
          verificationUrl: url,
        });

        await sendEmailTopic.publish({
          to: user.email,
          subject: "Verify your email address",
          html,
        });
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
            : `/org/${organization.slug}/register`,
          baseURL
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
        } else {
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
        // Cookie domain depends on which domain you're using
        // For Vercel: ".instride.vercel.app"
        // For custom: ".instrideapp.com"
        domain: ".instride.vercel.app", // or ".instrideapp.com"
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
