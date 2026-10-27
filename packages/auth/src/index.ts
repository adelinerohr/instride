import { expo } from "@better-auth/expo";
import type { Database } from "@instride/db";
import {
  accounts,
  sessions,
  users,
  verifications,
} from "@instride/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const ONE_DAY = 60 * 60 * 24;
const FIVE_MINUTES = 60 * 5;

export interface AuthConfig {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  NODE_ENV: "development" | "production" | "test";
}

export function getTrustedOrigins(isProd: boolean): string[] {
  if (isProd) {
    return [
      "https://app.instrideapp.com",
      "https://instrideapp.com",
      "https://*.instrideapp.com",
      "https://instride.vercel.app",
      "https://*.instride.vercel.app",
      "instride://",
    ];
  }
  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://*.localhost:3000",
    "instride://",
    "exp://",
  ];
}

/**
 * Identity only: sign up, sign in, sessions, password reset.
 * Organizations and memberships are our own tables and routers in @instride/api.
 */
export function createAuth(env: AuthConfig, db: Database) {
  const isProd = env.NODE_ENV === "production";

  return betterAuth({
    basePath: "/auth",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins(isProd),

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
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
