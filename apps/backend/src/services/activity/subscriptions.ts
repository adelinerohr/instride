// apps/backend/src/services/activity-feed/subscriptions.ts
import { Subscription } from "encore.dev/pubsub";

import { db } from "@/database";
import { activity } from "@/database/schema";

import { postCreated } from "../feed/topics";
import { lessonEnrolled } from "../lessons/topics";
import { ActivitySubjectType, ActivityType } from "./types/models";

export const onRiderEnrolledInInstance = new Subscription(
  lessonEnrolled,
  "activity-rider-enrolled",
  {
    handler: async (event) => {
      const activities = [];

      // Create activity for rider's profile
      activities.push({
        organizationId: event.organizationId,
        actorMemberId: event.enrolledByMemberId, // Who enrolled them
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
        createdAt: new Date(),
      });

      // If trainer enrolled them (not self-enrollment), add to trainer's feed too
      if (event.enrolledByMemberId === event.trainerMemberId) {
        activities.push({
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
          createdAt: new Date(),
        });
      }

      await db.insert(activity).values(activities);
    },
  }
);

// Role-neutral activity (e.g., post created)
export const onPostCreated = new Subscription(
  postCreated,
  "activity-post-created",
  {
    handler: async (event) => {
      // This shows on BOTH profiles (if member has both)
      // OR just on the member's general feed

      // Get member's profiles
      const member = await db.query.members.findFirst({
        where: {
          id: event.authorMemberId,
        },
        with: {
          rider: true,
          trainer: true,
        },
      });

      if (!member) return;

      const activities = [];

      // Add to rider profile if they have one
      if (member.rider) {
        activities.push({
          organizationId: event.organizationId,
          actorMemberId: event.authorMemberId,
          riderId: member.rider.id,
          ownerMemberId: event.authorMemberId,
          subjectType: ActivitySubjectType.POST,
          subjectId: event.postId,
          type: ActivityType.POST_CREATED,
          metadata: {
            postId: event.postId,
            content: event.content,
          },
          createdAt: new Date(),
        });
      }

      // Add to trainer profile if they have one
      if (member.trainer) {
        activities.push({
          organizationId: event.organizationId,
          actorMemberId: event.authorMemberId,
          trainerId: member.trainer.id,
          ownerMemberId: event.authorMemberId,
          subjectType: ActivitySubjectType.POST,
          subjectId: event.postId,
          type: ActivityType.POST_CREATED,
          metadata: {
            postId: event.postId,
            content: event.content,
          },
          createdAt: new Date(),
        });
      }

      // If they have neither profile, create a role-neutral entry
      if (!member.rider && !member.trainer) {
        activities.push({
          organizationId: event.organizationId,
          actorMemberId: event.authorMemberId,
          ownerMemberId: event.authorMemberId,
          subjectType: ActivitySubjectType.POST,
          subjectId: event.postId,
          type: ActivityType.POST_CREATED,
          metadata: {
            postId: event.postId,
            content: event.content,
          },
          createdAt: new Date(),
        });
      }

      if (activities.length > 0) {
        await db.insert(activity).values(activities);
      }
    },
  }
);
