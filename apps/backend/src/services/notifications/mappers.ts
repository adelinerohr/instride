import type {
  Notification,
  NotificationPreference,
} from "@instride/api/contracts";

import type { NotificationPreferenceRow, NotificationRow } from "./schema";

export function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    organizationId: row.organizationId,
    recipientId: row.recipientId,
    type: row.type,
    title: row.title,
    message: row.message,
    entityType: row.entityType,
    entityId: row.entityId,
    deepLink: row.deepLink,
    isRead: row.isRead,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export function toNotificationPreference(
  row: NotificationPreferenceRow
): NotificationPreference {
  return {
    id: row.id,
    organizationId: row.organizationId,
    memberId: row.memberId,
    type: row.type,
    inAppEnabled: row.inAppEnabled,
    pushEnabled: row.pushEnabled,
    emailEnabled: row.emailEnabled,
    smsEnabled: row.smsEnabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
