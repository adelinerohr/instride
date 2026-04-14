import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  GetTimeBlockResponse,
  ListTimeBlocksResponse,
} from "../types/contracts";
import { TimeBlock } from "../types/models";

interface ListTimeBlocksRequest {
  trainerId?: string;
  from?: string;
  to?: string;
}

export const listTimeBlocks = api(
  {
    method: "GET",
    path: "/time-blocks",
    expose: true,
    auth: true,
  },
  async (request: ListTimeBlocksRequest): Promise<ListTimeBlocksResponse> => {
    const { organizationId } = requireOrganizationAuth();

    let timeBlocks: TimeBlock[] = [];

    if (request.trainerId && !request.from && !request.to) {
      timeBlocks = await db.query.timeBlocks.findMany({
        where: {
          organizationId,
          trainerId: request.trainerId,
        },
      });
    }

    if (!request.trainerId && request.from && request.to) {
      timeBlocks = await db.query.timeBlocks.findMany({
        where: {
          organizationId,
          start: { gte: new Date(request.from) },
          end: { lte: new Date(request.to) },
        },
        orderBy: {
          start: "asc",
        },
      });
    }

    if (request.trainerId && request.from && request.to) {
      timeBlocks = await db.query.timeBlocks.findMany({
        where: {
          organizationId,
          trainerId: request.trainerId,
          start: { gte: new Date(request.from) },
          end: { lte: new Date(request.to) },
        },
        orderBy: {
          start: "asc",
        },
      });
    }

    return { timeBlocks };
  }
);

export const getTimeBlock = api(
  {
    method: "GET",
    path: "/time-blocks/:id",
    expose: true,
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetTimeBlockResponse> => {
    const timeBlock = await db.query.timeBlocks.findFirst({
      where: { id },
    });
    if (!timeBlock) {
      throw APIError.notFound("Time block not found");
    }
    return { timeBlock };
  }
);
