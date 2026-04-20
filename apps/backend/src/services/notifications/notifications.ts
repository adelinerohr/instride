import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { notificationDeliveries, notifications } from "@/database/schema";

import { db } from "./db";
import { getPreferences } from "./preferences";
import { GetNotificationResponse } from "./types/contracts";
import {
  Notification,
  NotificationChannel,
  NotificationType,
} from "./types/models";
import { getEnabledChannels } from "./utils";

interface CreateNotificationRequest {
  organizationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId?: string;
  deepLink?: string;
  channels?: NotificationChannel[];
}

/**
 * Internal helper. Call this from pub/sub subscriptions and other
 * server-side code. Use `createNotification` (the api wrapper) only
 * when something outside the backend needs to hit it.
 */
export async function createNotificationInternal(
  request: CreateNotificationRequest
): Promise<GetNotificationResponse> {
  const [notification] = await db
    .insert(notifications)
    .values(request)
    .returning();

  const preferences = await getPreferences({
    memberId: request.recipientId,
  });

  // If the member has no preferences row yet, fall back to in-app only.
  const channels =
    request.channels ??
    (preferences
      ? getEnabledChannels(preferences)
      : (["in_app"] as NotificationChannel[]));

  await Promise.allSettled(
    channels.map((channel) =>
      dispatchInternal({ notificationId: notification.id, channel })
    )
  );

  return { notification };
}

export const createNotification = api(
  {
    method: "POST",
    path: "/notifications",
    expose: true,
    auth: true,
  },
  createNotificationInternal
);

interface DispatchNotificationRequest {
  notificationId: string;
  channel: NotificationChannel;
}

async function dispatchInternal(
  request: DispatchNotificationRequest
): Promise<void> {
  let externalId: string | undefined;

  try {
    switch (request.channel) {
      case "push":
        console.log("push");
        break;
      case "email":
        console.log("email");
        break;
      case "sms":
        console.log("sms");
        break;
      case "in_app":
        // Already stored, no external service needed
        break;
    }

    await db.insert(notificationDeliveries).values({
      notificationId: request.notificationId,
      channel: request.channel,
      externalId,
      status: "sent",
    });
  } catch (error) {
    // One channel failing shouldn't break others. Log the failure, but
    // guard the failure-write itself so a DB outage doesn't throw again.
    try {
      await db.insert(notificationDeliveries).values({
        notificationId: request.notificationId,
        channel: request.channel,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (logError) {
      console.error(
        "Failed to record notification delivery failure",
        logError,
        error
      );
    }
  }
}

// Remove the `dispatch` api export entirely unless something external needs it.
// If you do need to keep it exposed, make it a thin wrapper:
// export const dispatch = api({ ... }, dispatchInternal);

export const markAsRead = api(
  {
    method: "POST",
    path: "/notifications/:notificationId/read",
    expose: true,
    auth: true,
  },
  async ({
    notificationId,
  }: {
    notificationId: string;
  }): Promise<GetNotificationResponse> => {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId))
      .returning();

    return { notification };
  }
);

interface GetUnreadResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const getUnread = api(
  {
    method: "GET",
    path: "/notifications/:memberId/unread-count",
    expose: true,
    auth: true,
  },
  async ({ memberId }: { memberId: string }): Promise<GetUnreadResponse> => {
    const unread = await db.query.notifications.findMany({
      where: {
        recipientId: memberId,
        isRead: false,
      },
    });

    return { notifications: unread, unreadCount: unread.length };
  }
);
