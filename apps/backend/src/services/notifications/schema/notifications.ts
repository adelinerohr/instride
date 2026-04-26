import { NotificationType } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { members } from "@/services/organizations/schema/members";
import { organizations } from "@/services/organizations/schema/organizations";

export const notificationTypeEnum = p.pgEnum(
  "notification_type",
  NotificationType
);

export const notifications = p.pgTable(
  "notifications",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    recipientId: p
      .uuid("recipient_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),

    type: notificationTypeEnum("type").notNull(),

    title: p.text("title").notNull(),
    message: p.text("message").notNull(),

    // Link to the related entity
    entityType: p.text("entity_type").notNull(), // "lesson", "payment", etc.
    entityId: p.uuid("entity_id"),

    // Deep link for mobile/web navigation
    deepLink: p.text("deep_link"), // e.g., "/lessons/abc-123"

    // State
    isRead: p.boolean("is_read").notNull().default(false),
    readAt: p.timestamp("read_at", { withTimezone: true }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    p
      .index("notifications_recipient_idx")
      .on(table.recipientId, table.createdAt),
    p
      .index("notifications_unread_idx")
      .on(table.recipientId, table.isRead, table.createdAt),
  ]
);

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
