import { NotificationChannel, NotificationType } from "@instride/shared";
import { and, eq, sql } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import {
  notificationDeliveries,
  notificationPreferences,
  notifications,
  type NewNotificationDeliveryRow,
  type NewNotificationPreferenceRow,
  type NewNotificationRow,
  type NotificationPreferenceRow,
} from "./schema";

export const createNotificationService = (
  client: Database | Transaction = db
) => ({
  // ============================================================================
  // Notifications
  // ============================================================================

  create: async (data: NewNotificationRow) => {
    const [notification] = await client
      .insert(notifications)
      .values(data)
      .returning();
    assertExists(notification, "Failed to create notification");
    return notification;
  },

  findOne: async (id: string) => {
    const notification = await client.query.notifications.findFirst({
      where: { id },
    });
    assertExists(notification, "Notification not found");
    return notification;
  },

  findUnreadForMember: async (memberId: string) => {
    return await client.query.notifications.findMany({
      where: { recipientId: memberId, isRead: false },
      orderBy: { createdAt: "desc" },
    });
  },

  markRead: async (id: string, organizationId: string) => {
    const [notification] = await client
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(notification, "Notification not found");
    return notification;
  },

  // ============================================================================
  // Preferences
  // ============================================================================

  findPreferenceForType: async (params: {
    memberId: string;
    organizationId: string;
    type: NotificationType;
  }) => {
    return await client.query.notificationPreferences.findFirst({
      where: {
        memberId: params.memberId,
        organizationId: params.organizationId,
        type: params.type,
      },
    });
  },

  /** All preferences for a member. Returns one row per notification type. */
  findPreferencesForMember: async (params: {
    memberId: string;
    organizationId: string;
  }) => {
    return await client.query.notificationPreferences.findMany({
      where: {
        memberId: params.memberId,
        organizationId: params.organizationId,
      },
    });
  },

  upsertPreferences: async (rows: NewNotificationPreferenceRow[]) => {
    if (rows.length === 0) return [];
    return await client
      .insert(notificationPreferences)
      .values(rows)
      .onConflictDoUpdate({
        target: [
          notificationPreferences.memberId,
          notificationPreferences.organizationId,
          notificationPreferences.type,
        ],
        set: {
          inAppEnabled: sql`excluded.in_app_enabled`,
          pushEnabled: sql`excluded.push_enabled`,
          emailEnabled: sql`excluded.email_enabled`,
          smsEnabled: sql`excluded.sms_enabled`,
        },
      })
      .returning();
  },

  // ============================================================================
  // Delivery records
  // ============================================================================

  recordDelivery: async (data: NewNotificationDeliveryRow) => {
    await client.insert(notificationDeliveries).values(data);
  },
});

export const notificationService = createNotificationService();

/**
 * Always-on channel + opt-in channels per the member's preferences.
 * If no preferences row exists, returns `[in_app]` only.
 */
export function getEnabledChannels(
  preferences: NotificationPreferenceRow | null
): NotificationChannel[] {
  if (!preferences) return [NotificationChannel.IN_APP];

  const channels: NotificationChannel[] = [NotificationChannel.IN_APP];
  if (preferences.pushEnabled) channels.push(NotificationChannel.PUSH);
  if (preferences.emailEnabled) channels.push(NotificationChannel.EMAIL);
  if (preferences.smsEnabled) channels.push(NotificationChannel.SMS);
  return channels;
}
