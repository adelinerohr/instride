import {
  GuardianRelationshipStatus,
  KioskAction,
  KioskActions,
  KioskActionContext,
  KioskActingState,
  KioskActiveActingState,
  KioskScope,
} from "@instride/shared";
import { APIError } from "encore.dev/api";

import { boardRepo } from "../boards/board.repo";
import { guardianRepo } from "../guardians/guardian.repo";
import { lessonInstanceRepo } from "../lessons/instances/instance.repo";
import { toLessonInstance } from "../lessons/mappers";

const STAFF_ONLY_ACTIONS = new Set<KioskAction>([
  KioskActions.LESSON_EDIT,
  KioskActions.TIME_BLOCK_CREATE,
  KioskActions.TIME_BLOCK_EDIT,
]);

type GuardianBookingPermission = "canBookLessons" | "canCancel";

export function assertActiveActing(
  acting: KioskActingState
): asserts acting is KioskActiveActingState {
  if (!acting.actingMemberId || acting.scope === KioskScope.DEFAULT) {
    throw APIError.permissionDenied("No active kiosk session");
  }
  if (!acting.expiresAt || new Date(acting.expiresAt).getTime() < Date.now()) {
    throw APIError.permissionDenied("Kiosk session expired");
  }
}

export async function assertKioskActionAllowed(input: {
  organizationId: string;
  actingMemberId: string;
  scope: KioskScope;
  context: KioskActionContext;
}): Promise<void> {
  if (input.scope === KioskScope.DEFAULT) {
    throw APIError.permissionDenied(
      "You must verify identity to perform actions"
    );
  }

  // Staff can do anything kiosk-exposed
  if (input.scope === KioskScope.STAFF) return;

  if (STAFF_ONLY_ACTIONS.has(input.context.action)) {
    throw APIError.permissionDenied("Only staff can perform this action");
  }

  switch (input.context.action) {
    case KioskActions.ENROLL:
    case KioskActions.MARK_ATTENDANCE:
    case KioskActions.LESSON_CHECK_IN: {
      await assertSelfOrAuthorizedGuardian({
        organizationId: input.organizationId,
        actingMemberId: input.actingMemberId,
        targetMemberId: input.context.targetMemberId,
        permissionKey: "canBookLessons",
      });
      return;
    }

    case KioskActions.UNENROLL: {
      await assertSelfOrAuthorizedGuardian({
        organizationId: input.organizationId,
        actingMemberId: input.actingMemberId,
        targetMemberId: input.context.targetMemberId,
        permissionKey: "canCancel",
      });
      return;
    }

    case KioskActions.LESSON_CREATE: {
      const board = await boardRepo.findOne(
        input.context.boardId,
        input.organizationId
      );
      if (!board) throw APIError.notFound("Board not found");
      if (!board.canRiderAdd) {
        throw APIError.permissionDenied(
          "Riders cannot create lessons on this board"
        );
      }
      return;
    }

    case KioskActions.LESSON_CANCEL: {
      await assertCanCancelLesson({
        organizationId: input.organizationId,
        actingMemberId: input.actingMemberId,
        lessonInstanceId: input.context.lessonInstanceId,
      });
      return;
    }

    case KioskActions.LESSON_EDIT:
    case KioskActions.TIME_BLOCK_CREATE:
    case KioskActions.TIME_BLOCK_EDIT:
      // Already rejected above by STAFF_ONLY_ACTIONS guard.
      throw APIError.permissionDenied("Only staff can perform this action");
  }
}

export async function assertSelfOrAuthorizedGuardian(input: {
  organizationId: string;
  actingMemberId: string;
  targetMemberId: string;
  permissionKey: GuardianBookingPermission;
}): Promise<void> {
  if (input.actingMemberId === input.targetMemberId) return;

  const relationship = await guardianRepo.findRelationshipBetween({
    guardianMemberId: input.actingMemberId,
    dependentMemberId: input.targetMemberId,
    organizationId: input.organizationId,
  });

  if (
    !relationship ||
    relationship.status !== GuardianRelationshipStatus.ACTIVE ||
    relationship.revokedAt
  ) {
    throw APIError.permissionDenied("You are not a guardian of this user");
  }

  // Approval workflow not yet implemented — block any action that requires it.
  if (relationship.permissions.bookings.requiresApproval) {
    throw APIError.permissionDenied(
      "This action requires guardian approval — not yet supported"
    );
  }

  if (!relationship.permissions.bookings[input.permissionKey]) {
    throw APIError.permissionDenied(
      "Guardian does not have permission for this action"
    );
  }
}

async function assertCanCancelLesson(input: {
  organizationId: string;
  actingMemberId: string;
  lessonInstanceId: string;
}): Promise<void> {
  const lessonRow = await lessonInstanceRepo.findOneExpanded(
    input.lessonInstanceId,
    input.organizationId
  );
  const lesson = toLessonInstance(lessonRow);

  const eligibleTargetIds = await getEligibleTargetMemberIds({
    organizationId: input.organizationId,
    actingMemberId: input.actingMemberId,
    permissionKey: "canCancel",
  });

  const enrolledMemberIds = lesson.enrollments.map((e) => e.rider.memberId);
  const isPrivate = lesson.service.isPrivate || lesson.service.maxRiders === 1;

  // Rule 1: private lesson, target is enrolled.
  if (isPrivate) {
    const match = enrolledMemberIds.find((id) => eligibleTargetIds.has(id));
    if (match) return;
  }

  // Rule 2: group lesson, target created it, target is sole enrollee.
  if (
    !isPrivate &&
    lesson.enrollments.length === 1 &&
    lesson.createdByMemberId &&
    eligibleTargetIds.has(lesson.createdByMemberId) &&
    enrolledMemberIds[0] === lesson.createdByMemberId
  ) {
    return;
  }

  throw APIError.permissionDenied("You cannot cancel this lesson");
}

async function getEligibleTargetMemberIds(input: {
  organizationId: string;
  actingMemberId: string;
  permissionKey: GuardianBookingPermission;
}): Promise<Set<string>> {
  const ids = new Set<string>([input.actingMemberId]);

  const relationships = await guardianRepo.listMyDependents({
    guardianMemberId: input.actingMemberId,
    organizationId: input.organizationId,
  });

  for (const rel of relationships) {
    if (rel.status !== "active" || rel.revokedAt) continue;
    if (rel.permissions.bookings.requiresApproval) continue;
    if (!rel.permissions.bookings[input.permissionKey]) continue;
    ids.add(rel.dependentMemberId);
  }

  return ids;
}
