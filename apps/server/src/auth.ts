import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { db } from "@/db";
import { accounts, sessions, users, verifications } from "@/db/schema/auth";
import { env, isProd } from "@/env";

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const ONE_DAY = 60 * 60 * 24;
const FIVE_MINUTES = 60 * 5;

export const trustedOrigins = isProd
  ? [
      "https://app.instrideapp.com",
      "https://instrideapp.com",
      "https://*.instrideapp.com",
      "https://instride.vercel.app",
      "https://*.instride.vercel.app",
      "instride://",
    ]
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://*.localhost:3000",
      "instride://",
      "exp://",
    ];

/**
 * Identity only: sign up, sign in, sessions, password reset.
 * Organizations and memberships are handled by our own routers.
 */
export const auth = betterAuth({
  basePath: "/auth",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      dateOfBirth: { type: "string", required: false },
      imageKey: { type: "string", required: false, input: false },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },

  session: {
    expiresIn: SEVEN_DAYS,
    updateAge: ONE_DAY,
    cookieCache: { enabled: true, maxAge: FIVE_MINUTES },
  },

  advanced: {
    database: { generateId: () => crypto.randomUUID() },
    ...(isProd && {
      crossSubDomainCookies: { enabled: true, domain: ".instrideapp.com" },
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    }),
  },

  plugins: [expo(), admin()],
});

export type AuthSession = typeof auth.$Infer.Session;
