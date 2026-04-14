import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const availabilityRelations = defineRelationsPart(schema, (r) => ({
  organizationAvailability: {
    organization: r.one.organizations({
      from: r.organizationAvailability.organizationId,
      to: r.organizations.id,
    }),
    board: r.one.boards({
      from: r.organizationAvailability.boardId,
      to: r.boards.id,
    }),
  },

  trainerAvailability: {
    organization: r.one.organizations({
      from: r.trainerAvailability.organizationId,
      to: r.organizations.id,
    }),
    trainer: r.one.trainers({
      from: r.trainerAvailability.trainerId,
      to: r.trainers.id,
    }),
    board: r.one.boards({
      from: r.trainerAvailability.boardId,
      to: r.boards.id,
    }),
  },

  timeBlocks: {
    organization: r.one.organizations({
      from: r.timeBlocks.organizationId,
      to: r.organizations.id,
    }),
    trainer: r.one.trainers({
      from: r.timeBlocks.trainerId,
      to: r.trainers.id,
    }),
    board: r.one.boards({
      from: r.timeBlocks.boardId,
      to: r.boards.id,
    }),
  },
}));
