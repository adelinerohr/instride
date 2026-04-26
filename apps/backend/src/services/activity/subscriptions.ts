import { ActivitySubjectType, ActivityType } from "@instride/shared";
import { Subscription } from "encore.dev/pubsub";

import { postCreated } from "../feed/topics";
import { lessonEnrolled } from "../lessons/topics";
import { activityService } from "./activity.service";
import { db } from "./db";

export const onRiderEnrolledInInstance = new Subscription(
  lessonEnrolled,
  "activity-rider-enrolled",
  {
    handler: async (event) => {
      const rows = [];

      // Activity for the rider's profile
      rows.push({
        organizationId: event.organizationId,
        actorMemberId: event.enrolledByMemberId,
        ownerMemberId: event.riderMemberId,
        riderId: event.riderId,
        subjectType: ActivitySubjectType.LESSON,
        subjectId: event.instanceId,
        type: ActivityType.ENROLLMENT_CREATED,
        metadata: {
          instanceId: event.instanceId,
          seriesId: event.seriesId,
          trainerName: event.trainerName,
          trainerMemberId: event.trainerMemberId,
          startTime: event.startTime,
          endTime: event.endTime,
          lessonName: event.lessonName ?? "",
        },
      });

      // If the trainer enrolled them, also surface on the trainer's feed
      if (event.enrolledByMemberId === event.trainerMemberId) {
        rows.push({
          organizationId: event.organizationId,
          actorMemberId: event.trainerMemberId,
          ownerMemberId: event.trainerMemberId,
          trainerId: event.trainerId,
          subjectType: ActivitySubjectType.LESSON,
          subjectId: event.instanceId,
          type: ActivityType.ENROLLMENT_CREATED,
          metadata: {
            instanceId: event.instanceId,
            seriesId: event.seriesId,
            riderName: event.riderName,
            riderMemberId: event.riderMemberId,
            startTime: event.startTime,
            endTime: event.endTime,
            lessonName: event.lessonName ?? "",
          },
        });
      }

      await activityService.createMany(rows);
    },
  }
);

export const onPostCreated = new Subscription(
  postCreated,
  "activity-post-created",
  {
    handler: async (event) => {
      const member = await db.query.members.findFirst({
        where: { id: event.authorMemberId },
        with: { rider: true, trainer: true },
      });

      if (!member) return;

      const rows = [];
      const baseMetadata = { postId: event.postId, content: event.content };

      if (member.rider) {
        rows.push({
          organizationId: event.organizationId,
          actorMemberId: event.authorMemberId,
          ownerMemberId: event.authorMemberId,
          riderId: member.rider.id,
          subjectType: ActivitySubjectType.POST,
          subjectId: event.postId,
          type: ActivityType.POST_CREATED,
          metadata: baseMetadata,
        });
      }

      if (member.trainer) {
        rows.push({
          organizationId: event.organizationId,
          actorMemberId: event.authorMemberId,
          ownerMemberId: event.authorMemberId,
          trainerId: member.trainer.id,
          subjectType: ActivitySubjectType.POST,
          subjectId: event.postId,
          type: ActivityType.POST_CREATED,
          metadata: baseMetadata,
        });
      }

      // Neither role: role-neutral entry
      if (!member.rider && !member.trainer) {
        rows.push({
          organizationId: event.organizationId,
          actorMemberId: event.authorMemberId,
          ownerMemberId: event.authorMemberId,
          subjectType: ActivitySubjectType.POST,
          subjectId: event.postId,
          type: ActivityType.POST_CREATED,
          metadata: baseMetadata,
        });
      }

      await activityService.createMany(rows);
    },
  }
);
