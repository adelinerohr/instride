import { format } from "date-fns";
import { Subscription } from "encore.dev/pubsub";

import { lessonEnrolled } from "../lessons/topics";
import { createNotification } from "./notifications";
import { NotificationType } from "./types/models";

const _ = new Subscription(lessonEnrolled, "notify-lesson-enrolled", {
  handler: async (event) => {
    await createNotification({
      organizationId: event.organizationId,
      recipientId: event.riderMemberId,
      type: NotificationType.ENROLLMENT_CREATED,
      title: "Enrolled in Lesson",
      message: event.lessonName
        ? `You've been enrolled in ${event.lessonName} on ${format(event.startTime, "yyyy-MM-dd HH:mm")}`
        : `You've been enrolled in a lesson on ${format(event.startTime, "yyyy-MM-dd HH:mm")}`,
      entityType: "lesson",
      entityId: event.instanceId,
      deepLink: `/lessons/${event.instanceId}`,
    });
  },
});
