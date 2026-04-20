import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { GetLevelResponse, ListLevelsResponse } from "../types/contracts";

export const listLevels = api(
  {
    expose: true,
    method: "GET",
    path: "/levels",
    auth: true,
  },
  async (): Promise<ListLevelsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const levels = await db.query.levels.findMany({
      where: { organizationId },
    });
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
    const level = await db.query.levels.findFirst({
      where: { organizationId, id: levelId },
    });
    if (!level) {
      throw APIError.notFound("Level not found");
    }
    return { level };
  }
);
