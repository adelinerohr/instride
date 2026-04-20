import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";
import { notificationDeliveries, notifications } from "@/database/schema";

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
  // Override default channels for this specific notification
  channels?: NotificationChannel[];
}

export const createNotification = api(
  {
    method: "POST",
    path: "/notifications",
    expose: true,
    auth: true,
  },
  async (
    request: CreateNotificationRequest
  ): Promise<GetNotificationResponse> => {
    const [notification] = await db
      .insert(notifications)
      .values(request)
      .returning();

    // 2. Get user's preferences for this notification type
    const preferences = await getPreferences({
      memberId: request.recipientId,
    });

    // 3. Determine which channels to use
    const channels = request.channels ?? getEnabledChannels(preferences);

    // 4. Dispatch to each enabled channel (async, don't block)
    await Promise.allSettled(
      channels.map((channel) =>
        dispatch({ notificationId: notification.id, channel })
      )
    );

    return { notification };
  }
);

interface DispatchNotificationRequest {
  notificationId: string;
  channel: NotificationChannel;
}

export const dispatch = api(
  {
    method: "POST",
    path: "/notifications/:notificationId/dispatch",
    expose: true,
    auth: true,
  },
  async (request: DispatchNotificationRequest): Promise<void> => {
    try {
      let externalId: string | undefined;

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

      // Record the delivery attempt
      await db.insert(notificationDeliveries).values({
        notificationId: request.notificationId,
        channel: request.channel,
        externalId,
        status: "sent",
      });
    } catch (error) {
      // Log but don't throw - one channel failing shouldn't break others
      await db.insert(notificationDeliveries).values({
        notificationId: request.notificationId,
        channel: request.channel,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

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
