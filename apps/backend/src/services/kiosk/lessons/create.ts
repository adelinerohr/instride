import type {
  KioskCreateLessonInstanceRequest,
  GetLessonInstanceResponse,
} from "@instride/api/contracts";
import { KioskActions, KioskScope } from "@instride/shared";
import { api, APIError } from "encore.dev/api";
import { lessons } from "~encore/clients";

import { lessonInstanceRepo } from "@/services/lessons/instances/instance.repo";
import { toLessonInstance } from "@/services/lessons/mappers";
import { requireOrganizationAuth } from "@/shared/auth";

import { resolveKioskActor } from "../actor";
import { assertSelfOrAuthorizedGuardian } from "../permissions";

export const kioskCreateLessonInstance = api(
  {
    method: "POST",
    path: "/kiosk/lessons/instances",
    expose: true,
    auth: true,
  },
  async (
    request: KioskCreateLessonInstanceRequest
  ): Promise<GetLessonInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const actor = await resolveKioskActor({
      sessionId: request.sessionId,
      organizationId,
      verification: request.verification,
      context: {
        action: KioskActions.LESSON_CREATE,
        boardId: request.boardId,
      },
    });

    if (actor.scope === KioskScope.SELF) {
      await assertSelfOrAuthorizedGuardian({
        organizationId,
        actingMemberId: actor.memberId,
        targetMemberId: request.riderMemberId,
        permissionKey: "canBookLessons",
      });

      if (request.isRecurring) {
        throw APIError.permissionDenied(
          "Riders cannot create recurring lessons"
        );
      }
    }

    const created = await lessons.createLessonSeries({
      ...request.input,
      createdByMemberId: actor.memberId,
    });

    const instance = await lessonInstanceRepo.findStandaloneBySeries(
      created.series.id,
      organizationId
    );

    return { instance: toLessonInstance(instance) };
  }
);
