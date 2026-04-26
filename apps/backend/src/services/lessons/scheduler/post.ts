import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import {
  generateInstancesForSeries,
  type GenerateLessonInstancesResult,
} from "./generate";

interface GenerateLessonInstancesRequest {
  seriesId: string;
  /** ISO-8601 string. Encore serializes Date over the wire as a string. */
  until: string;
}

/**
 * HTTP endpoint for on-demand generation. The cron does NOT call this —
 * it calls `generateInstancesForSeries` directly since it has no session.
 */
export const generateLessonInstances = api(
  {
    method: "POST",
    path: "/lessons/scheduler/generate",
    auth: true,
  },
  async (
    request: GenerateLessonInstancesRequest
  ): Promise<GenerateLessonInstancesResult> => {
    requireOrganizationAuth();
    const { member } = await organizations.getMember();

    return generateInstancesForSeries({
      seriesId: request.seriesId,
      until: new Date(request.until),
      createdByMemberId: member.id,
    });
  }
);
