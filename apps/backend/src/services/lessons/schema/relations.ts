import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const lessonsRelations = defineRelationsPart(schema, (r) => ({
  levels: {
    organization: r.one.organizations({
      from: r.levels.organizationId,
      to: r.organizations.id,
    }),
    riders: r.many.riders({
      from: r.levels.id,
      to: r.riders.ridingLevelId,
    }),
    services: r.many.services({
      from: r.levels.id,
      to: r.services.restrictedToLevelId,
    }),
    lessonSeries: r.many.lessonSeries({
      from: r.levels.id,
      to: r.lessonSeries.levelId,
    }),
    lessonInstances: r.many.lessonInstances({
      from: r.levels.id,
      to: r.lessonInstances.levelId,
    }),
  },

  lessonSeries: {
    organization: r.one.organizations({
      from: r.lessonSeries.organizationId,
      to: r.organizations.id,
    }),
    board: r.one.boards({
      from: r.lessonSeries.boardId,
      to: r.boards.id,
    }),
    trainer: r.one.trainers({
      from: r.lessonSeries.trainerId,
      to: r.trainers.id,
    }),
    level: r.one.levels({
      from: r.lessonSeries.levelId,
      to: r.levels.id,
    }),
    service: r.one.services({
      from: r.lessonSeries.serviceId,
      to: r.services.id,
    }),
    instances: r.many.lessonInstances({
      from: r.lessonSeries.id,
      to: r.lessonInstances.seriesId,
    }),
    enrollments: r.many.lessonSeriesEnrollments({
      from: r.lessonSeries.id,
      to: r.lessonSeriesEnrollments.seriesId,
    }),
    createdBy: r.one.members({
      from: r.lessonSeries.createdByMemberId,
      to: r.members.id,
    }),
    updatedBy: r.one.members({
      from: r.lessonSeries.updatedByMemberId,
      to: r.members.id,
    }),
  },

  lessonInstances: {
    organization: r.one.organizations({
      from: r.lessonInstances.organizationId,
      to: r.organizations.id,
    }),
    series: r.one.lessonSeries({
      from: r.lessonInstances.seriesId,
      to: r.lessonSeries.id,
    }),
    board: r.one.boards({
      from: r.lessonInstances.boardId,
      to: r.boards.id,
    }),
    trainer: r.one.trainers({
      from: r.lessonInstances.trainerId,
      to: r.trainers.id,
    }),
    level: r.one.levels({
      from: r.lessonInstances.levelId,
      to: r.levels.id,
    }),
    service: r.one.services({
      from: r.lessonInstances.serviceId,
      to: r.services.id,
    }),
    enrollments: r.many.lessonInstanceEnrollments({
      from: r.lessonInstances.id,
      to: r.lessonInstanceEnrollments.instanceId,
    }),
    canceledBy: r.one.members({
      from: r.lessonInstances.canceledByMemberId,
      to: r.members.id,
    }),
  },

  lessonSeriesEnrollments: {
    organization: r.one.organizations({
      from: r.lessonSeriesEnrollments.organizationId,
      to: r.organizations.id,
    }),
    series: r.one.lessonSeries({
      from: r.lessonSeriesEnrollments.seriesId,
      to: r.lessonSeries.id,
    }),
    rider: r.one.riders({
      from: r.lessonSeriesEnrollments.riderId,
      to: r.riders.id,
    }),
    instanceEnrollments: r.many.lessonInstanceEnrollments({
      from: r.lessonSeriesEnrollments.id,
      to: r.lessonInstanceEnrollments.fromSeriesEnrollmentId,
    }),
    enrolledBy: r.one.members({
      from: r.lessonSeriesEnrollments.enrolledByMemberId,
      to: r.members.id,
    }),
    endedBy: r.one.members({
      from: r.lessonSeriesEnrollments.endedByMemberId,
      to: r.members.id,
    }),
  },

  lessonInstanceEnrollments: {
    organization: r.one.organizations({
      from: r.lessonInstanceEnrollments.organizationId,
      to: r.organizations.id,
    }),
    instance: r.one.lessonInstances({
      from: r.lessonInstanceEnrollments.instanceId,
      to: r.lessonInstances.id,
    }),
    rider: r.one.riders({
      from: r.lessonInstanceEnrollments.riderId,
      to: r.riders.id,
    }),
    fromSeriesEnrollment: r.one.lessonSeriesEnrollments({
      from: r.lessonInstanceEnrollments.fromSeriesEnrollmentId,
      to: r.lessonSeriesEnrollments.id,
    }),
    enrolledBy: r.one.members({
      from: r.lessonInstanceEnrollments.enrolledByMemberId,
      to: r.members.id,
    }),
    unenrolledBy: r.one.members({
      from: r.lessonInstanceEnrollments.unenrolledByMemberId,
      to: r.members.id,
    }),
    markedBy: r.one.members({
      from: r.lessonInstanceEnrollments.markedByMemberId,
      to: r.members.id,
    }),
  },
}));
