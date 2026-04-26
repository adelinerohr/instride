import type {
  CheckLessonHoursRequest,
  CheckLessonHoursResponse,
} from "@instride/api/contracts";
import { getDayOfWeek, isWithinAnySlot } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { resolveEffectiveDayHours } from "./utils";

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
        : effectiveOrgHours
          ? false
          : true;

    let withinTrainerHours: boolean | null = null;
    let effectiveTrainerHours = null;

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
