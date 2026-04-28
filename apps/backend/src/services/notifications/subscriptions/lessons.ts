import { NotificationType } from "@instride/shared";
import { parseISO } from "date-fns";
import { Subscription } from "encore.dev/pubsub";

import { lessonEnrolled } from "@/services/lessons/topics";

import { createNotificationInternal } from "../notifications";

const _lessonEnrolledSubscription = new Subscription(
  lessonEnrolled,
  "notify-lesson-enrolled",
  {
    handler: async (event) => {
      const startDate = parseISO(event.startTime);
      const formatted = startDate.toLocaleString();

      await createNotificationInternal({
        organizationId: event.organizationId,
        recipientId: event.riderMemberId,
        type: NotificationType.ENROLLMENT_CREATED,
        title: "Enrolled in Lesson",
        message: event.lessonName
          ? `You've been enrolled in ${event.lessonName} on ${formatted}`
          : `You've been enrolled in a lesson on ${formatted}`,
        entityType: "lesson",
        entityId: event.instanceId,
        deepLink: `/lessons/${event.instanceId}`,
      });
    },
  }
);
