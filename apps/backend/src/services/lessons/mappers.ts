import type {
  LessonInstance,
  LessonInstanceEnrollment,
  LessonInstanceEnrollmentWithInstance,
  LessonSeries,
  LessonSeriesEnrollment,
  LessonSeriesSummary,
  Level,
} from "@instride/api/contracts";

import { toBoard } from "@/services/boards/mappers";
import { toService } from "@/services/boards/mappers";
import { toRider, toTrainer } from "@/services/organizations/mappers";
import { toISO, toISOOrNull, toTimestamps } from "@/shared/utils/mappers";
import { assertExists } from "@/shared/utils/validation";

import type {
  LessonInstanceEnrollmentRow,
  LessonInstanceRow,
  LessonSeriesEnrollmentRow,
  LessonSeriesRow,
} from "./schema";

export function toLessonSeriesSummary(
  row: LessonSeriesRow
): LessonSeriesSummary {
  return {
    id: row.id,
    organizationId: row.organizationId,
    boardId: row.boardId,
    serviceId: row.serviceId,
    trainerId: row.trainerId,
    levelId: row.levelId,
    status: row.status,
    name: row.name,
    duration: row.duration,
    isRecurring: row.isRecurring,
    recurrenceFrequency: row.recurrenceFrequency,
    recurrenceByDay: row.recurrenceByDay,
    start: toISO(row.start),
  };
}

export function toLessonSeries(
  row: LessonSeriesRow & {
    level: Level | null;
    trainer: Parameters<typeof toTrainer>[0] | null;
    board: Parameters<typeof toBoard>[0] | null;
    service: Parameters<typeof toService>[0] | null;
    enrollments: Array<Parameters<typeof toSeriesEnrollment>[0]>;
  }
): LessonSeries {
  assertExists(row.trainer, "Series has no trainer");
  assertExists(row.board, "Series has no board");
  assertExists(row.service, "Series has no service");

  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
    start: toISO(row.start),
    recurrenceEnd: toISOOrNull(row.recurrenceEnd),
    effectiveFrom: toISOOrNull(row.effectiveFrom),
    lastPlannedUntil: toISOOrNull(row.lastPlannedUntil),
    level: row.level,
    trainer: toTrainer(row.trainer),
    board: toBoard(row.board),
    service: toService(row.service),
    enrollments: row.enrollments.map(toSeriesEnrollment),
  };
}

export function toLessonInstance(
  row: LessonInstanceRow & {
    level: LessonInstance["level"];
    trainer: Parameters<typeof toTrainer>[0] | null;
    board: Parameters<typeof toBoard>[0] | null;
    service: Parameters<typeof toService>[0] | null;
    series: LessonSeriesRow | null;
    enrollments: Array<Parameters<typeof toInstanceEnrollment>[0]>;
  }
): LessonInstance {
  assertExists(row.trainer, "Instance has no trainer");
  assertExists(row.board, "Instance has no board");
  assertExists(row.service, "Instance has no service");
  assertExists(row.series, "Instance has no series");

  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
    start: toISO(row.start),
    canceledAt: toISOOrNull(row.canceledAt),
    end: toISO(row.end),
    level: row.level,
    trainer: toTrainer(row.trainer),
    board: toBoard(row.board),
    service: toService(row.service),
    series: toLessonSeriesSummary(row.series),
    enrollments: row.enrollments.map(toInstanceEnrollment),
  };
}

export function toSeriesEnrollment(
  row: LessonSeriesEnrollmentRow & {
    rider: Parameters<typeof toRider>[0] | null;
  }
): LessonSeriesEnrollment {
  assertExists(row.rider, "Series enrollment has no rider");
  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
    enrolledAt: toISO(row.enrolledAt),
    endedAt: toISOOrNull(row.endedAt),
    rider: toRider(row.rider),
  };
}

export function toInstanceEnrollment(
  row: LessonInstanceEnrollmentRow & {
    rider: Parameters<typeof toRider>[0] | null;
  }
): LessonInstanceEnrollment {
  assertExists(row.rider, "Instance enrollment has no rider");
  return {
    ...row,
    enrolledAt: toISO(row.enrolledAt),
    attendedAt: toISOOrNull(row.attendedAt),
    unenrolledAt: toISOOrNull(row.unenrolledAt),
    rider: toRider(row.rider),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toInstanceEnrollmentWithInstance(
  row: LessonInstanceEnrollmentRow & {
    rider: Parameters<typeof toRider>[0] | null;
    instance: Parameters<typeof toLessonInstance>[0] | null;
  }
): LessonInstanceEnrollmentWithInstance {
  assertExists(row.instance, "Enrollment has no instance");
  return {
    ...toInstanceEnrollment(row),
    instance: toLessonInstance(row.instance),
  };
}
