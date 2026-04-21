import { expo } from "@better-auth/expo";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization, testUtils } from "better-auth/plugins";

import { organizationConfig } from "./organization";
import { userAdditionalFields } from "./schema";

interface DB {
  [key: string]: any;
}

export const betterAuthOptions = (opts: {
  db: DB;
  secret: string;
  baseURL: string;
  isProd: boolean;
}): BetterAuthOptions => ({
  basePath: "/auth",
  secret: opts.secret,
  baseURL: opts.baseURL,

  trustedOrigins: opts.isProd
    ? [
        "https://app.instrideapp.com",
        "https://instrideapp.com",
        "https://*.instrideapp.com",
        "https://instride.vercel.app",
        "https://*.instride.vercel.app",
      ]
    : [
        "http://localhost:4000",
        "http://127.0.0.1:4000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],

  database: drizzleAdapter(opts.db, { provider: "pg" }),

  plugins: [
    expo(),
    admin(),
    openAPI(),
    testUtils(),
    organization(organizationConfig),
  ],

  session: {
    modelName: "authSessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
    ...(opts.isProd && {
      cookieAttributes: {
        domain: ".instride.vercel.app",
        sameSite: "lax" as const,
        secure: true,
        httpOnly: true,
      },
    }),
  },
  user: {
    modelName: "authUsers",
    additionalFields: userAdditionalFields,
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

export type Auth = ReturnType<typeof betterAuth>;
