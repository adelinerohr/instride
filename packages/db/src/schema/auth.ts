import * as p from "drizzle-orm/pg-core";

import { timestamps } from "./_columns";

// -------------------------------------------------------------------------
// Better Auth tables: identity only (users, sessions, accounts, tokens).
// No organization plugin. Organizations, members and invitations are our own
// tables in organizations.ts.
//
// Ids are `text` so the existing users from the Encore database keep their
// original ids when migrated.
// -------------------------------------------------------------------------

export const users = p.pgTable("users", {
  id: p.text("id").primaryKey(),
  name: p.text("name").notNull(),
  email: p.text("email").notNull().unique(),
  emailVerified: p.boolean("email_verified").notNull().default(false),
  image: p.text("image"),
  imageKey: p.text("image_key"),
  phone: p.text("phone"),
  dateOfBirth: p.text("date_of_birth"),

  // Better Auth admin plugin (platform-level admin, not barn admin)
  role: p.text("role"),
  banned: p.boolean("banned").default(false),
  banReason: p.text("ban_reason"),
  banExpires: p.timestamp("ban_expires"),

  ...timestamps,
});

export const sessions = p.pgTable(
  "sessions",
  {
    id: p.text("id").primaryKey(),
    userId: p
      .text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: p.text("token").notNull().unique(),
    expiresAt: p.timestamp("expires_at").notNull(),
    ipAddress: p.text("ip_address"),
    userAgent: p.text("user_agent"),
    impersonatedBy: p.text("impersonated_by"),
    ...timestamps,
  },
  (t) => [p.index("sessions_user_id_idx").on(t.userId)]
);

export const accounts = p.pgTable(
  "accounts",
  {
    id: p.text("id").primaryKey(),
    userId: p
      .text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: p.text("account_id").notNull(),
    providerId: p.text("provider_id").notNull(),
    accessToken: p.text("access_token"),
    refreshToken: p.text("refresh_token"),
    idToken: p.text("id_token"),
    accessTokenExpiresAt: p.timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: p.timestamp("refresh_token_expires_at"),
    scope: p.text("scope"),
    password: p.text("password"),
    ...timestamps,
  },
  (t) => [p.index("accounts_user_id_idx").on(t.userId)]
);

export const verifications = p.pgTable(
  "verifications",
  {
    id: p.text("id").primaryKey(),
    identifier: p.text("identifier").notNull(),
    value: p.text("value").notNull(),
    expiresAt: p.timestamp("expires_at").notNull(),
    ...timestamps,
  },
  (t) => [p.index("verifications_identifier_idx").on(t.identifier)]
);
