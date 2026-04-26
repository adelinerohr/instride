import type { LessonInstance, Rider } from "@instride/api/contracts";
import { KioskScope } from "@instride/shared";
import { isSameDay } from "date-fns";

import { db } from "../db";

interface BookingRuleResult {
  canBook: boolean;
  reason?: { code: string; message: string };
}

export async function assertKioskBookingRules(input: {
  rider: Rider;
  instance: LessonInstance;
  scope: KioskScope;
}): Promise<BookingRuleResult> {
  // Staff have no kiosk-side restrictions; rules below apply to SELF only
  if (input.scope === KioskScope.STAFF) return { canBook: true };

  const now = new Date();
  const start = new Date(input.instance.start);

  // 1. Cannot book past lessons
  if (start < now) {
    return {
      canBook: false,
      reason: { code: "past_lesson", message: "Cannot book past lessons" },
    };
  }

  // 2. Already enrolled
  const existingEnrollment = await db.query.lessonInstanceEnrollments.findFirst(
    {
      where: { instanceId: input.instance.id, riderId: input.rider.id },
    }
  );
  if (existingEnrollment) {
    return {
      canBook: false,
      reason: {
        code: "already_enrolled",
        message: "Already enrolled in this lesson",
      },
    };
  }

  // 3. Level restriction
  if (
    input.instance.levelId &&
    input.rider.ridingLevelId !== input.instance.levelId
  ) {
    return {
      canBook: false,
      reason: {
        code: "level_restriction",
        message: "Rider is not eligible for this lesson",
      },
    };
  }

  // 4. Board restriction — rider must be assigned to the lesson's board
  // Read directly from rider.boardAssignments (loaded via Rider contract).
  if (
    input.instance.boardId &&
    !input.rider.boardAssignments.some(
      (ba) => ba.board.id === input.instance.boardId
    )
  ) {
    return {
      canBook: false,
      reason: {
        code: "board_restriction",
        message: "Rider is not eligible for this lesson",
      },
    };
  }

  // 5. Same-day booking restriction (per the lesson's trainer)
  if (
    isSameDay(start, now) &&
    input.instance.trainer &&
    input.instance.trainer.allowSameDayBookings !== true
  ) {
    return {
      canBook: false,
      reason: {
        code: "same_day_booking_restriction",
        message: "Cannot book same day lessons",
      },
    };
  }

  return { canBook: true };
}
