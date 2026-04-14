import { MembershipRole } from "@instride/shared";
import { api } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { activity } from "./schema";
import { GetActivityResponse } from "./types/contracts";
import {
  ActivityMetadata,
  ActivitySubjectType,
  ActivityType,
} from "./types/models";

interface CreateActivityRequest {
  metadata: ActivityMetadata;
  ownerMemberId: string;
  subjectType: ActivitySubjectType;
  subjectId: string;
  type: ActivityType;
  actorMemberId?: string | null;
  actorRole?: MembershipRole;
}

export const createActivity = api(
  {
    method: "POST",
    path: "/activity",
    expose: true,
    auth: true,
  },
  async (request: CreateActivityRequest): Promise<GetActivityResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const [insertedActivity] = await db
      .insert(activity)
      .values({
        ...request,
        organizationId,
      })
      .returning();

    return { activity: insertedActivity };
  }
);
