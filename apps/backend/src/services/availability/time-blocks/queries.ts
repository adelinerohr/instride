import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { ListTimeBlocksResponse } from "../types/contracts";
import { TimeBlock } from "../types/models";

interface ListTimeBlocksParams {
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
  async (params: ListTimeBlocksParams): Promise<ListTimeBlocksResponse> => {
    const { organizationId } = requireOrganizationAuth();

    let timeBlocks: TimeBlock[] = [];

    if (params.trainerId && !params.from && !params.to) {
      timeBlocks = await db.query.timeBlocks.findMany({
        where: {
          organizationId,
          trainerId: params.trainerId,
        },
      });
    }

    if (!params.trainerId && params.from && params.to) {
      timeBlocks = await db.query.timeBlocks.findMany({
        where: {
          organizationId,
          start: { gte: new Date(params.from) },
          end: { lte: new Date(params.to) },
        },
        orderBy: {
          start: "asc",
        },
      });
    }

    if (params.trainerId && params.from && params.to) {
      timeBlocks = await db.query.timeBlocks.findMany({
        where: {
          organizationId,
          trainerId: params.trainerId,
          start: { gte: new Date(params.from) },
          end: { lte: new Date(params.to) },
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
  async (params: { id: string }): Promise<TimeBlock> => {
    const timeBlock = await db.query.timeBlocks.findFirst({
      where: { id: params.id },
    });
    if (!timeBlock) {
      throw APIError.notFound("Time block not found");
    }
    return timeBlock;
  }
);
