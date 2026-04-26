import type {
  CreateNotificationRequest,
  GetNotificationResponse,
  GetUnreadResponse,
} from "@instride/api/contracts";
import { NotificationChannel } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { toNotification } from "./mappers";
import {
  getEnabledChannels,
  notificationService,
} from "./notification.service";

interface CreateInput extends CreateNotificationRequest {
  organizationId: string;
}

/**
 * Internal notification creation. Safe to call from pub/sub subscriptions
 * because it does not call `requireOrganizationAuth` — the caller passes
 * `organizationId` explicitly.
 */
export async function createNotificationInternal(
  input: CreateInput
): Promise<GetNotificationResponse> {
  const notification = await notificationService.create({
    organizationId: input.organizationId,
    recipientId: input.recipientId,
    type: input.type,
    title: input.title,
    message: input.message,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    deepLink: input.deepLink ?? null,
  });

  // Resolve channels: explicit override → recipient's preferences → in-app only
  let channels: NotificationChannel[];
  if (input.channels) {
    channels = input.channels;
  } else {
    const preference = await notificationService.findPreferenceForType({
      memberId: input.recipientId,
      organizationId: input.organizationId,
      type: input.type,
    });
    channels = getEnabledChannels(preference ?? null);
  }

  // Dispatch on each channel; one failure shouldn't drop others
  await Promise.allSettled(
    channels.map((channel) => dispatchToChannel(notification.id, channel))
  );

  return { notification: toNotification(notification) };
}

/**
 * HTTP endpoint wraps the internal helper, adding auth scope.
 */
export const createNotification = api(
  { method: "POST", path: "/notifications", expose: true, auth: true },
  async (
    request: CreateNotificationRequest
  ): Promise<GetNotificationResponse> => {
    const { organizationId } = requireOrganizationAuth();
    return createNotificationInternal({ ...request, organizationId });
  }
);

async function dispatchToChannel(
  notificationId: string,
  channel: NotificationChannel
): Promise<void> {
  let externalId: string | undefined;

  try {
    switch (channel) {
      case NotificationChannel.PUSH:
        // TODO: integrate push provider
        break;
      case NotificationChannel.EMAIL:
        // TODO: integrate email provider
        break;
      case NotificationChannel.SMS:
        // TODO: integrate SMS provider (Telnyx)
        break;
      case NotificationChannel.IN_APP:
        // Already stored in the notifications table
        break;
    }

    await notificationService.recordDelivery({
      notificationId,
      channel,
      externalId,
      status: "sent",
    });
  } catch (error) {
    // Defensive: if recording the failure also throws, log to console as
    // a last resort so the original error isn't swallowed
    try {
      await notificationService.recordDelivery({
        notificationId,
        channel,
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
    const { organizationId } = requireOrganizationAuth();
    const notification = await notificationService.markRead(
      notificationId,
      organizationId
    );
    return { notification: toNotification(notification) };
  }
);

export const getUnread = api(
  {
    method: "GET",
    path: "/notifications/:memberId/unread-count",
    expose: true,
    auth: true,
  },
  async ({ memberId }: { memberId: string }): Promise<GetUnreadResponse> => {
    requireOrganizationAuth();
    const unread = await notificationService.findUnreadForMember(memberId);
    return {
      notifications: unread.map(toNotification),
      unreadCount: unread.length,
    };
  }
);
