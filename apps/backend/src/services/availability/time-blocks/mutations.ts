import type {
  CreateTimeBlockRequest,
  GetTimeBlockResponse,
  UpdateTimeBlockRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { toTimeBlock } from "../mappers";
import { timeBlockService } from "./service";

export const createTimeBlock = api(
  { method: "POST", path: "/time-blocks", expose: true, auth: true },
  async (params: CreateTimeBlockRequest): Promise<GetTimeBlockResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const timeBlock = await timeBlockService.create({
      ...params,
      organizationId,
      start: new Date(params.start),
      end: new Date(params.end),
    });

    return { timeBlock: toTimeBlock(timeBlock) };
  }
);

export const updateTimeBlock = api(
  { method: "PUT", path: "/time-blocks/:id", expose: true, auth: true },
  async (params: UpdateTimeBlockRequest): Promise<GetTimeBlockResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { id, ...rest } = params;

    const timeBlock = await timeBlockService.update(id, organizationId, {
      ...rest,
      start: new Date(rest.start),
      end: new Date(rest.end),
    });

    return { timeBlock: toTimeBlock(timeBlock) };
  }
);

export const deleteTimeBlock = api(
  { method: "DELETE", path: "/time-blocks/:id", expose: true, auth: true },
  async (params: { id: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    await timeBlockService.delete(params.id, organizationId);
  }
);
