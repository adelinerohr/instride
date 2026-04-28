import {
  MessageResponseStatus,
  NotificationEntityType,
  NotificationType,
} from "@instride/shared";
import { Subscription } from "encore.dev/pubsub";

import {
  chatMessageCreated,
  chatResponseUpdated,
} from "@/services/chat/topics";

import { createNotificationInternal } from "../notifications";
import { buildNotificationCopy, fetchMessageContext } from "../utils/chat";

const _messageSububscription = new Subscription(
  chatMessageCreated,
  "notify-chat-message-created",
  {
    handler: async (event) => {
      // For each recipient, create a notification
      const recipients = event.recipientMemberIds.filter(
        (id) => id !== event.senderId
      );

      const messageRow = await fetchMessageContext(event.messageId);

      for (const recipientId of recipients) {
        const { type, title, message } = buildNotificationCopy({
          attachmentType: messageRow.attachmentType ?? null,
          senderName: messageRow.sender.authUser.name,
          messageBody: messageRow.body,
        });

        await createNotificationInternal({
          organizationId: event.organizationId,
          recipientId,
          type,
          title,
          message,
          entityType: "message",
          entityId: event.messageId,
          deepLink: `/messages/${event.conversationId}`,
        });
      }
    },
  }
);

const _responseSubscription = new Subscription(
  chatResponseUpdated,
  "notify-chat-response-updated",
  {
    handler: async (event) => {
      if (
        event.status !== MessageResponseStatus.ACCEPTED &&
        event.status !== MessageResponseStatus.DECLINED
      ) {
        return;
      }

      const messageRow = await fetchMessageContext(event.messageId);

      const type =
        event.status === MessageResponseStatus.ACCEPTED
          ? NotificationType.CHAT_LESSON_ACCEPTED
          : NotificationType.CHAT_LESSON_DECLINED;

      const verb =
        event.status === MessageResponseStatus.ACCEPTED
          ? "Accepted"
          : "Declined";

      await createNotificationInternal({
        organizationId: event.organizationId,
        recipientId: messageRow.senderId,
        type,
        title: `Lesson invitation ${verb}`,
        message: `${messageRow.sender.authUser.name} ${verb} your lesson invitation`,
        entityType: NotificationEntityType.MESSAGE,
        entityId: event.messageId,
        deepLink: `/messages/${event.conversationId}`,
      });
    },
  }
);
