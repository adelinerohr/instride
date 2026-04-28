import type {
  CreateNotificationRequest,
  GetNotificationResponse,
  GetUnreadResponse,
} from "@instride/api/contracts";
import { NotificationChannel } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { dispatchEmail } from "./channels/email";
import { toNotification } from "./mappers";
import { getEnabledChannels, notificationRepo } from "./notification.repo";
import { NotificationRow } from "./schema";

interface CreateInput extends CreateNotificationRequest {
  organizationId: string;
}

// =============================================================================
// Internal helper — safe to call from Pub/Sub subscribers
// =============================================================================
//
// Idempotent on (recipientId, sourceEventId). If a row already exists for
// the same source event, we return the existing notification WITHOUT
// re-dispatching the external channels — the original creation already
// emailed them.

export async function createNotificationInternal(
  input: CreateInput
): Promise<GetNotificationResponse> {
  const { notification, wasCreated } = await notificationRepo.create({
    organizationId: input.organizationId,
    recipientId: input.recipientId,
    type: input.type,
    title: input.title,
    message: input.message,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    deepLink: input.deepLink ?? null,
    sourceEventId: input.sourceEventId ?? null,
  });

  // Already created and dispatched on a previous delivery of the same
  // source event - return the existing row
  if (!wasCreated) {
    return { notification: toNotification(notification) };
  }

  // Resolve channels: explicit override -> recipient's preferences -> defaults
  let channels: NotificationChannel[];
  if (input.channels) {
    channels = input.channels;
  } else {
    const preference = await notificationRepo.findPreferenceForType({
      memberId: input.recipientId,
      organizationId: input.organizationId,
      type: input.type,
    });
    channels = getEnabledChannels(preference ?? null);
  }

  await dispatch(notification, channels);
  return { notification: toNotification(notification) };
}

// =============================================================================
// External channel dispatch
// =============================================================================
//
// In-app is implicit (the notification row IS the in-app delivery, no
// extra step needed). Today only EMAIL has a real dispatch path; PUSH and
// SMS are filtered out upstream by getEnabledChannels and will be added
// here when those channels go live.

async function dispatch(
  notification: NotificationRow,
  channels: NotificationChannel[]
): Promise<void> {
  if (channels.includes(NotificationChannel.EMAIL)) {
    await dispatchEmail(notification);
  }
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
    const notification = await notificationRepo.markRead(
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
    const unread = await notificationRepo.findUnreadForMember(memberId);
    return {
      notifications: unread.map(toNotification),
      unreadCount: unread.length,
    };
  }
);
