import * as p from "drizzle-orm/pg-core";

import { NotificationChannel } from "../types/models";
import { notifications } from "./notifications";

export const notificationChannelEnum = p.pgEnum(
  "notification_channel",
  NotificationChannel
);

// Track what was sent via which channel (for audit/debugging)
export const notificationDeliveries = p.pgTable(
  "notification_deliveries",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    notificationId: p
      .uuid("notification_id")
      .notNull()
      .references(() => notifications.id, {
        onDelete: "cascade",
      }),

    channel: notificationChannelEnum("channel").notNull(),

    // External IDs for tracking
    externalId: p.text("external_id"), // Expo push ticket ID, email message ID, etc.

    status: p.text("status").notNull(), // "sent", "failed", "delivered"
    error: p.text("error"),

    sentAt: p
      .timestamp("sent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deliveredAt: p.timestamp("delivered_at", { withTimezone: true }),
  },
  (table) => [p.index("deliveries_notification_idx").on(table.notificationId)]
);
