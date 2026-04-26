import * as p from "drizzle-orm/pg-core";

import { members } from "@/services/organizations/schema/members";
import { organizations } from "@/services/organizations/schema/organizations";

// Push tokens for mobile devices
export const notificationPushTokens = p.pgTable(
  "push_tokens",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    memberId: p
      .uuid("member_id")
      .notNull()
      .references(() => members.id),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id),

    token: p.text("token").notNull(), // Expo push token
    platform: p.varchar("platform", { length: 10 }).notNull(), // "ios", "android"

    // Which org's app is this token for (important for white-label)
    appBundleId: p.text("app_bundle_id").notNull(),

    isActive: p.boolean("is_active").notNull().default(true),

    lastUsedAt: p
      .timestamp("last_used_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: p
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    p.index("push_tokens_member_idx").on(table.memberId),
    p.unique().on(table.token),
  ]
);

export type NotificationPushTokenRow =
  typeof notificationPushTokens.$inferSelect;
export type NewNotificationPushTokenRow =
  typeof notificationPushTokens.$inferInsert;
