import type {
  GetAffectedInstancesRequest,
  UpsertEventRequest,
} from "@instride/api/contracts";
import { EventScope, LessonInstanceStatus } from "@instride/shared";
import { APIError } from "encore.dev/api";

import { Database, Transaction } from "@/shared/utils/schema";

import type { NewEventSchedulingBlockRow } from "./schema";

export function validateEventScope(input: {
  scope: EventScope;
  boardIds?: string[] | null;
  trainerIds?: string[] | null;
}): void {
  if (input.scope === EventScope.BOARD && input.trainerIds?.length) {
    throw APIError.invalidArgument("Board scope cannot include trainerIds");
  }
  if (input.scope === EventScope.TRAINER && input.boardIds?.length) {
    throw APIError.invalidArgument("Trainer scope cannot include boardIds");
  }
  if (input.scope === EventScope.ORGANIZATION) {
    if (input.boardIds?.length || input.trainerIds?.length) {
      throw APIError.invalidArgument(
        "Organization scope cannot include boardIds or trainerIds"
      );
    }
  }
}

export function buildSchedulingBlocks(
  input: Pick<UpsertEventRequest, "scope" | "boardIds" | "trainerIds"> & {
    eventId: string;
  }
): NewEventSchedulingBlockRow[] {
  if (input.scope === EventScope.ORGANIZATION) {
    return [
      {
        eventId: input.eventId,
        scope: EventScope.ORGANIZATION,
        boardId: null,
        trainerId: null,
      },
    ];
  }

  const ids = input.boardIds ?? input.trainerIds ?? [];
  return ids.map((id) => ({
    eventId: input.eventId,
    scope: input.scope,
    boardId: input.scope === EventScope.BOARD ? id : null,
    trainerId: input.scope === EventScope.TRAINER ? id : null,
  }));
}

export async function findAffectedInstances(
  client: Database | Transaction,
  params: {
    organizationId: string;
    window: GetAffectedInstancesRequest;
  }
) {
  const { organizationId, window } = params;
  const startDate = new Date(window.startDate);
  const endDate = new Date(window.endDate);

  const baseWhere = {
    organizationId,
    status: LessonInstanceStatus.SCHEDULED,
    start: { gte: startDate, lte: endDate },
  };

  switch (window.scope) {
    case EventScope.ORGANIZATION:
      return await client.query.lessonInstances.findMany({ where: baseWhere });

    case EventScope.BOARD:
      return await client.query.lessonInstances.findMany({
        where: {
          ...baseWhere,
          boardId: { in: window.boardIds ?? [] },
        },
      });

    case EventScope.TRAINER:
      return await client.query.lessonInstances.findMany({
        where: {
          ...baseWhere,
          trainerId: { in: window.trainerIds ?? [] },
        },
      });

    default:
      throw APIError.invalidArgument("Invalid scope");
  }
}
