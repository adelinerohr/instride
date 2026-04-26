import type {
  ListActivityRequest,
  ListActivityResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { activityService } from "./activity.service";
import { toActivity } from "./mappers";

export const listActivity = api(
  { method: "GET", path: "/activity", expose: true, auth: true },
  async (request: ListActivityRequest): Promise<ListActivityResponse> => {
    const { organizationId } = requireOrganizationAuth();

    // Three independent buckets get merged. Could be a single SQL query
    // with OR conditions, but separate queries make the intent clearer
    // and the data sets are small (per-member, not org-wide).
    const queries: Promise<unknown[]>[] = [
      activityService.findRoleNeutral({
        organizationId,
        ownerMemberId: request.ownerMemberId,
      }),
    ];

    if (request.riderId) {
      queries.push(
        activityService.findForRider({
          organizationId,
          riderId: request.riderId,
        })
      );
    }

    if (request.trainerId) {
      queries.push(
        activityService.findForTrainer({
          organizationId,
          trainerId: request.trainerId,
        })
      );
    }

    const buckets = await Promise.all(queries);
    const merged = buckets.flat() as Parameters<typeof toActivity>[0][];

    merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { activities: merged.map(toActivity) };
  }
);
