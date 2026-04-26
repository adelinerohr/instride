import * as p from "drizzle-orm/pg-core";

import { members } from "@/services/organizations/schema/members";
import { organizations } from "@/services/organizations/schema/organizations";
import { timeStamps } from "@/shared/utils/schema";

import { notificationTypeEnum } from "./notifications";

// User preferences per notification type
export const notificationPreferences = p.pgTable(
  "notification_preferences",
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

    type: notificationTypeEnum("type").notNull(),

    inAppEnabled: p.boolean("in_app_enabled").notNull().default(true),
    pushEnabled: p.boolean("push_enabled").notNull().default(true),
    emailEnabled: p.boolean("email_enabled").notNull().default(true),
    smsEnabled: p.boolean("sms_enabled").notNull().default(false), // Opt-in

    ...timeStamps,
  },
  (table) => [
    p.index("notif_prefs_member_type_idx").on(table.memberId, table.type),
    p.unique().on(table.memberId, table.organizationId, table.type),
  ]
);

export type NotificationPreferenceRow =
  typeof notificationPreferences.$inferSelect;
export type NewNotificationPreferenceRow =
  typeof notificationPreferences.$inferInsert;
