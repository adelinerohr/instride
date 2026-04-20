import { isSameDay } from "date-fns";
import { boards } from "~encore/clients";

import { LessonInstance } from "../../lessons/types/models";
import { Rider } from "../../organizations/types/models";
import { db } from "../db";
import { KioskScope } from "../types/models";

interface AssertKioskBookingRulesResponse {
  canBook: boolean;
  reason?: {
    code: string;
    message: string;
  };
}

export async function assertKioskBookingRules(input: {
  rider: Rider;
  instance: LessonInstance;
  scope: KioskScope;
}): Promise<AssertKioskBookingRulesResponse> {
  const now = new Date();
  const start = new Date(input.instance.start);

  // If the acting member is a trainer or admin, they have no restrictions
  if (input.scope === KioskScope.STAFF) {
    return {
      canBook: true,
    };
  }

  // 1. Cannot book past lessons
  if (start < now) {
    return {
      canBook: false,
      reason: {
        code: "past_lesson",
        message: "Cannot book past lessons",
      },
    };
  }

  // 2. Already enrolled
  const existingEnrollment = await db.query.lessonInstanceEnrollments.findFirst(
    {
      where: {
        instanceId: input.instance.id,
        riderId: input.rider.id,
      },
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

  // 4. Board restriction
  const { boards: riderBoards } = await boards.getBoardsForRider({
    riderId: input.rider.id,
  });
  if (
    input.instance.boardId &&
    !riderBoards.some((board) => board.id === input.instance.boardId)
  ) {
    return {
      canBook: false,
      reason: {
        code: "board_restriction",
        message: "Rider is not eligible for this lesson",
      },
    };
  }

  // 7. Same day booking restriction
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

  return {
    canBook: true,
  };
}
