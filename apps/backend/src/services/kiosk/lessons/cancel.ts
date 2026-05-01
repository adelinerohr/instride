import type {
  GetLessonInstanceResponse,
  KioskCancelLessonInstanceRequest,
} from "@instride/api/contracts";
import { KioskActions } from "@instride/shared";
import { api } from "encore.dev/api";

import { lessonInstanceRepo } from "@/services/lessons/instances/instance.repo";
import { cancelLessonInstance } from "@/services/lessons/instances/mutations";
import { toLessonInstance } from "@/services/lessons/mappers";
import { requireOrganizationAuth } from "@/shared/auth";

import { resolveKioskActor } from "../actor";

export const kioskCancelLessonInstance = api(
  {
    method: "POST",
    path: "/kiosk/lessons/instances/:instanceId/cancel",
    expose: true,
    auth: true,
  },
  async (
    request: KioskCancelLessonInstanceRequest
  ): Promise<GetLessonInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const actor = await resolveKioskActor({
      sessionId: request.sessionId,
      organizationId,
      verification: request.verification,
      context: {
        action: KioskActions.LESSON_CANCEL,
        lessonInstanceId: request.instanceId,
      },
    });

    await cancelLessonInstance({
      instanceId: request.instanceId,
      canceledByMemberId: actor.memberId,
      reason: request.reason,
    });

    const instance = await lessonInstanceRepo
      .findOneExpanded(request.instanceId, organizationId)
      .then(toLessonInstance);

    return { instance };
  }
);
