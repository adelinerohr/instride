import { defineRelationsPart } from "drizzle-orm/relations";

import * as schema from "@/database/schema";

export const boardsRelations = defineRelationsPart(schema, (r) => ({
  boards: {
    organization: r.one.organizations({
      from: r.boards.organizationId,
      to: r.organizations.id,
    }),
    assignments: r.many.boardAssignments({
      from: r.boards.id,
      to: r.boardAssignments.boardId,
    }),
    organizationAvailability: r.many.organizationAvailability({
      from: r.boards.id,
      to: r.organizationAvailability.boardId,
    }),
    trainerAvailability: r.many.trainerAvailability({
      from: r.boards.id,
      to: r.trainerAvailability.boardId,
    }),
    timeBlocks: r.many.timeBlocks({
      from: r.boards.id,
      to: r.timeBlocks.boardId,
    }),
    lessonSeries: r.many.lessonSeries({
      from: r.boards.id,
      to: r.lessonSeries.boardId,
    }),
    lessonInstances: r.many.lessonInstances({
      from: r.boards.id,
      to: r.lessonInstances.boardId,
    }),
    serviceBoardAssignments: r.many.serviceBoardAssignments({
      from: r.boards.id,
      to: r.serviceBoardAssignments.boardId,
    }),
    feedPosts: r.many.feedPosts({
      from: r.boards.id,
      to: r.feedPosts.boardId,
    }),
    questionnaires: r.many.questionnaires({
      from: r.boards.id,
      to: r.questionnaires.defaultBoardId,
    }),
  },

  boardAssignments: {
    board: r.one.boards({
      from: r.boardAssignments.boardId,
      to: r.boards.id,
    }),
    organization: r.one.organizations({
      from: r.boardAssignments.organizationId,
      to: r.organizations.id,
    }),
    trainer: r.one.trainers({
      from: r.boardAssignments.trainerId,
      to: r.trainers.id,
    }),
    rider: r.one.riders({
      from: r.boardAssignments.riderId,
      to: r.riders.id,
    }),
  },

  services: {
    organization: r.one.organizations({
      from: r.services.organizationId,
      to: r.organizations.id,
    }),
    restrictedToLevel: r.one.levels({
      from: r.services.restrictedToLevelId,
      to: r.levels.id,
    }),
    trainerAssignments: r.many.serviceTrainerAssignments({
      from: r.services.id,
      to: r.serviceTrainerAssignments.serviceId,
    }),
    boardAssignments: r.many.serviceBoardAssignments({
      from: r.services.id,
      to: r.serviceBoardAssignments.serviceId,
    }),
    lessonSeries: r.many.lessonSeries({
      from: r.services.id,
      to: r.lessonSeries.serviceId,
    }),
  },

  serviceTrainerAssignments: {
    service: r.one.services({
      from: r.serviceTrainerAssignments.serviceId,
      to: r.services.id,
    }),
    organization: r.one.organizations({
      from: r.serviceTrainerAssignments.organizationId,
      to: r.organizations.id,
    }),
    trainer: r.one.trainers({
      from: r.serviceTrainerAssignments.trainerId,
      to: r.trainers.id,
    }),
  },

  serviceBoardAssignments: {
    service: r.one.services({
      from: r.serviceBoardAssignments.serviceId,
      to: r.services.id,
    }),
    organization: r.one.organizations({
      from: r.serviceBoardAssignments.organizationId,
      to: r.organizations.id,
    }),
    board: r.one.boards({
      from: r.serviceBoardAssignments.boardId,
      to: r.boards.id,
    }),
  },
}));
