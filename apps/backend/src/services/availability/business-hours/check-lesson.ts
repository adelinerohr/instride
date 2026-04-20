import { getDayOfWeek, isWithinAnySlot } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { BusinessHoursDay } from "../types/models";
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
  effectiveOrgHours: BusinessHoursDay | null;
  effectiveTrainerHours: BusinessHoursDay | null;
  passes: boolean;
}

/**
 * Check whether a proposed lesson falls inside the effective org and trainer hours.
 *
 * "Within hours" means the entire [startTime, endTime) interval fits inside
 * at least one slot of the effective day.
 */
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

    const withinOrgHours =
      effectiveOrgHours && effectiveOrgHours.isOpen
        ? isWithinAnySlot({
            startTime: request.startTime,
            endTime: request.endTime,
            slots: effectiveOrgHours.slots,
          })
        : effectiveOrgHours // configured but closed
          ? false
          : true; // no hours configured = no restriction

    let withinTrainerHours: boolean | null = null;
    let effectiveTrainerHours: BusinessHoursDay | null = null;

    if (request.trainerId) {
      effectiveTrainerHours = await resolveEffectiveDayHours({
        organizationId,
        trainerId: request.trainerId,
        dayOfWeek,
        boardId: request.boardId,
      });

      withinTrainerHours =
        effectiveTrainerHours && effectiveTrainerHours.isOpen
          ? isWithinAnySlot({
              startTime: request.startTime,
              endTime: request.endTime,
              slots: effectiveTrainerHours.slots,
            })
          : effectiveTrainerHours
            ? false
            : true;
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
