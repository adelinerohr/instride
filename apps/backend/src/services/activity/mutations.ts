import type {
  CreateActivityRequest,
  GetActivityResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { activityService } from "./activity.service";
import { db } from "./db";
import { activityExpansion } from "./fragments";
import { toActivity } from "./mappers";

export const createActivity = api(
  { method: "POST", path: "/activity", expose: true, auth: true },
  async (request: CreateActivityRequest): Promise<GetActivityResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const created = await activityService.create({
      ...request,
      organizationId,
    });

    // Re-load with actorMember relation to satisfy the contract
    const full = await db.query.activity.findFirst({
      where: { id: created.id },
      with: activityExpansion,
    });
    assertExists(full, "Failed to load activity after create");

    return { activity: toActivity(full) };
  }
);
