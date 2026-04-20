import { EventScope, LessonInstanceStatus } from "@instride/shared";
import { APIError } from "encore.dev/api";

import { Transaction } from "@/shared/utils/schema";

import { LessonInstance } from "../lessons/types/models";
import { db } from "./db";
import { GetEventResponse } from "./types/contracts";
import { Event } from "./types/models";

export function validateEventScope(input: {
  scope: EventScope;
  boardIds?: string[] | null;
  trainerIds?: string[] | null;
}): void {
  if (input.scope === EventScope.BOARD && input.trainerIds?.length) {
    throw APIError.invalidArgument(
      "Board and trainer IDs cannot be used together"
    );
  }
  if (input.scope === EventScope.TRAINER && input.boardIds?.length) {
    throw APIError.invalidArgument(
      "Trainer and board IDs cannot be used together"
    );
  }
}

export function buildSchedulingBlocks(input: {
  scope: EventScope;
  eventId: string;
  blockScheduling: boolean;
  boardIds?: string[] | null;
  trainerIds?: string[] | null;
}) {
  return input.scope === EventScope.ORGANIZATION
    ? [
        {
          eventId: input.eventId,
          scope: EventScope.ORGANIZATION,
          blockScheduling: input.blockScheduling,
        },
      ]
    : (input.boardIds ?? input.trainerIds ?? []).map((id) => ({
        eventId: input.eventId,
        scope: input.scope,
        boardId: input.scope === EventScope.BOARD ? id : null,
        trainerId: input.scope === EventScope.TRAINER ? id : null,
        blockScheduling: input.blockScheduling,
      }));
}

export async function findAffectedInstances(input: {
  DB: typeof db | Transaction;
  organizationId: string;
  window: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  };
  block: {
    scope: EventScope;
    boardIds?: string[];
    trainerIds?: string[];
  };
}): Promise<LessonInstance[]> {
  const { DB, ...request } = input;

  if (input.block.scope === EventScope.ORGANIZATION) {
    const instances = await DB.query.lessonInstances.findMany({
      where: {
        organizationId: request.organizationId,
        status: LessonInstanceStatus.SCHEDULED,
        start: {
          gte: new Date(request.window.startDate),
          lte: new Date(request.window.endDate),
        },
      },
    });

    return instances;
  }

  if (input.block.scope === EventScope.BOARD) {
    const instances = await DB.query.lessonInstances.findMany({
      where: {
        organizationId: request.organizationId,
        status: LessonInstanceStatus.SCHEDULED,
        start: {
          gte: new Date(request.window.startDate),
          lte: new Date(request.window.endDate),
        },
        boardId: {
          in: request.block.boardIds,
        },
      },
    });

    return instances;
  }

  if (input.block.scope === EventScope.TRAINER) {
    const instances = await DB.query.lessonInstances.findMany({
      where: {
        organizationId: request.organizationId,
        status: LessonInstanceStatus.SCHEDULED,
        start: {
          gte: new Date(request.window.startDate),
          lte: new Date(request.window.endDate),
        },
        trainerId: {
          in: request.block.trainerIds,
        },
      },
    });

    return instances;
  }

  throw APIError.invalidArgument("Invalid scope");
}

export function getEventResponse(event: Event): GetEventResponse {
  if (
    event.blockScheduling &&
    event.schedulingBlocks &&
    event.schedulingBlocks.length > 0
  ) {
    const boardBlocks =
      event.schedulingBlocks.filter((block) => block.boardId !== null) ?? [];
    const trainerBlocks =
      event.schedulingBlocks.filter((block) => block.trainerId !== null) ?? [];

    return {
      event,
      scope: event.schedulingBlocks[0].scope,
      boardIds: boardBlocks
        .map((block) => block.boardId)
        .filter((id) => id !== null),
      trainerIds: trainerBlocks
        .map((block) => block.trainerId)
        .filter((id) => id !== null),
    };
  }

  return {
    event,
  };
}
