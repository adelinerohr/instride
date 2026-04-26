import type { Event, EventSchedulingBlock } from "@instride/api/contracts";
import { EventScope } from "@instride/shared";

import type { EventRow, EventSchedulingBlockRow } from "./schema";

export function toEventSchedulingBlock(
  row: EventSchedulingBlockRow
): EventSchedulingBlock {
  return {
    id: row.id,
    eventId: row.eventId,
    scope: row.scope,
    boardId: row.boardId,
    trainerId: row.trainerId,
  };
}

export function toEvent(
  row: EventRow & {
    schedulingBlocks: EventSchedulingBlockRow[];
  }
): Event {
  // The original `getEventResponse` returned the scope from the first
  // scheduling block. Empty blocks default to ORGANIZATION (which matches
  // the implicit behavior of the old code: events with no specific blocks
  // were org-wide).
  const scope = row.schedulingBlocks[0]?.scope ?? EventScope.ORGANIZATION;

  const boardIds = row.schedulingBlocks
    .map((block) => block.boardId)
    .filter((id): id is string => id !== null);

  const trainerIds = row.schedulingBlocks
    .map((block) => block.trainerId)
    .filter((id): id is string => id !== null);

  return {
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    startTime: row.startTime,
    endTime: row.endTime,
    blockScheduling: row.blockScheduling,
    scope,
    boardIds,
    trainerIds,
    createdByMemberId: row.createdByMemberId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
