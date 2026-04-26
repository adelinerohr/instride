import { GetLevelResponse, ListLevelsResponse } from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { levelService } from "./level.service";

export const listLevels = api(
  {
    expose: true,
    method: "GET",
    path: "/levels",
    auth: true,
  },
  async (): Promise<ListLevelsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const levels = await levelService.findMany(organizationId);
    return { levels };
  }
);

export const getLevel = api(
  {
    expose: true,
    method: "GET",
    path: "/levels/:levelId",
    auth: true,
  },
  async ({ levelId }: { levelId: string }): Promise<GetLevelResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const level = await levelService.findOne(levelId, organizationId);
    return { level };
  }
);
