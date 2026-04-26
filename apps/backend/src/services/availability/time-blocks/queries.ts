import type {
  GetTimeBlockResponse,
  ListTimeBlocksParams,
  ListTimeBlocksResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { toTimeBlock } from "../mappers";
import { timeBlockService } from "./service";

export const listTimeBlocks = api(
  { method: "GET", path: "/time-blocks", expose: true, auth: true },
  async (params: ListTimeBlocksParams): Promise<ListTimeBlocksResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const timeBlocks = await timeBlockService.findMany(organizationId, {
      trainerId: params.trainerId,
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? new Date(params.to) : undefined,
    });

    return { timeBlocks: timeBlocks.map(toTimeBlock) };
  }
);

export const getTimeBlock = api(
  { method: "GET", path: "/time-blocks/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<GetTimeBlockResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const timeBlock = await timeBlockService.findOne(id, organizationId);
    return { timeBlock: toTimeBlock(timeBlock) };
  }
);
