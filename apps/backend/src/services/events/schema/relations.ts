import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const eventsRelations = defineRelationsPart(schema, (r) => ({
  events: {
    organization: r.one.organizations({
      from: r.events.organizationId,
      to: r.organizations.id,
    }),
    createdByMember: r.one.members({
      from: r.events.createdByMemberId,
      to: r.members.id,
    }),
    schedulingBlocks: r.many.eventSchedulingBlocks({
      from: r.events.id,
      to: r.eventSchedulingBlocks.eventId,
    }),
  },
  schedulingBlocks: {
    event: r.one.events({
      from: r.eventSchedulingBlocks.eventId,
      to: r.events.id,
    }),
    board: r.one.boards({
      from: r.eventSchedulingBlocks.boardId,
      to: r.boards.id,
    }),
    trainer: r.one.trainers({
      from: r.eventSchedulingBlocks.trainerId,
      to: r.trainers.id,
    }),
  },
}));
