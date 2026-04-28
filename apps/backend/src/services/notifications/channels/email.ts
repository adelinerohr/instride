import { Member } from "@instride/api/contracts";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from "@instride/shared";
import log from "encore.dev/log";

import { sendEmailTopic } from "@/services/email/topic";
import { memberRepo } from "@/services/organizations/members/member.repo";

import { notificationRepo } from "../notification.repo";
import { NotificationRow } from "../schema";
import { renderNotificationEmail } from "../templates/render";

export async function dispatchEmail(
  notification: NotificationRow
): Promise<void> {
  let member: Member;
  try {
    member = await memberRepo.findOne(
      notification.recipientId,
      notification.organizationId
    );
  } catch (error) {
    log.error("Failed to resolve recipient email", { notification, error });
    return;
  }

  const rendered = await renderNotificationEmail({
    notification,
    recipientName: member.authUser.name,
  });
  if (!rendered) return;

  try {
    await sendEmailTopic.publish({
      to: member.authUser.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    await notificationRepo.recordDelivery({
      notificationId: notification.id,
      channel: NotificationChannel.EMAIL,
      status: NotificationDeliveryStatus.SENT,
    });
  } catch (error) {
    log.error("Failed to publish email event", { notification, error });
    await notificationRepo.recordDelivery({
      notificationId: notification.id,
      channel: NotificationChannel.EMAIL,
      status: NotificationDeliveryStatus.FAILED,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
