import { getDayOfWeek, isWithinHours } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { EffectiveDayHours } from "../types/models";
import { resolveEffectiveDayHours } from "./utils";

interface CheckLessonHoursRequest {
  boardId: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface CheckLessonHoursResponse {
  withinOrgHours: boolean;
  withinTrainerHours: boolean | null; // null if no trainer selected
  effectiveOrgHours: EffectiveDayHours | null;
  effectiveTrainerHours: EffectiveDayHours | null;
  passes: boolean;
}

export const checkLessonHours = api(
  {
    method: "POST",
    path: "/business-hours/check-lesson",
    expose: true,
    auth: true,
  },
  async (
    request: CheckLessonHoursRequest
  ): Promise<CheckLessonHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const dayOfWeek = getDayOfWeek(new Date(request.date));

    const effectiveOrgHours = await resolveEffectiveDayHours({
      organizationId,
      dayOfWeek,
      boardId: request.boardId,
    });

    const withinOrgHours = effectiveOrgHours
      ? isWithinHours(request.startTime, request.endTime, effectiveOrgHours)
      : true; // No hours configured = no restriction

    let withinTrainerHours: boolean | null = null;
    let effectiveTrainerHours: EffectiveDayHours | null = null;

    if (request.trainerId) {
      effectiveTrainerHours = await resolveEffectiveDayHours({
        organizationId,
        trainerId: request.trainerId,
        dayOfWeek,
        boardId: request.boardId,
      });

      withinTrainerHours = effectiveTrainerHours
        ? isWithinHours(
            request.startTime,
            request.endTime,
            effectiveTrainerHours
          )
        : true; // No hours configured = no restriction
    }

    return {
      withinOrgHours,
      withinTrainerHours,
      effectiveOrgHours,
      effectiveTrainerHours,
      passes:
        withinOrgHours && (withinTrainerHours === null || withinTrainerHours),
    };
  }
);
