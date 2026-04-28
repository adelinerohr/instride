import type {
  LessonInstance,
  LessonInstanceEnrollment,
  LessonInstanceEnrollmentWithInstance,
  LessonSeries,
  LessonSeriesEnrollment,
  LessonSeriesSummary,
} from "@instride/api/contracts";

import {
  BoardWithExpansionRow,
  ServiceWithExpansionRow,
  toBoard,
} from "@/services/boards/mappers";
import { toService } from "@/services/boards/mappers";
import {
  RiderWithExpansionRow,
  toLevel,
  toRider,
  toTrainer,
  TrainerWithExpansionRow,
} from "@/services/organizations/mappers";
import { toISO, toISOOrNull, toTimestamps } from "@/shared/utils/mappers";
import { assertExists } from "@/shared/utils/validation";

import { LevelRow } from "../organizations/schema";
import type {
  LessonInstanceEnrollmentRow,
  LessonInstanceRow,
  LessonSeriesEnrollmentRow,
  LessonSeriesRow,
} from "./schema";

// ---------------------------------------------------------------------------
// Augmented row types (row + relations as fetched via fragments)
// ---------------------------------------------------------------------------

export type LessonSeriesWithExpansionRow = LessonSeriesRow & {
  level: LevelRow | null;
  trainer: TrainerWithExpansionRow | null;
  board: BoardWithExpansionRow | null;
  service: ServiceWithExpansionRow | null;
  enrollments: LessonSeriesEnrollmentWithExpansionRow[];
};

export type LessonInstanceWithExpansionRow = LessonInstanceRow & {
  level: LevelRow | null;
  trainer: TrainerWithExpansionRow | null;
  board: BoardWithExpansionRow | null;
  service: ServiceWithExpansionRow | null;
  series: LessonSeriesRow | null;
  enrollments: InstanceEnrollmentWithExpansionRow[];
};

export type LessonSeriesEnrollmentWithExpansionRow =
  LessonSeriesEnrollmentRow & {
    rider: RiderWithExpansionRow | null;
  };

export type InstanceEnrollmentWithExpansionRow = LessonInstanceEnrollmentRow & {
  rider: RiderWithExpansionRow | null;
};

export type InstanceEnrollmentWithInstanceRow = LessonInstanceEnrollmentRow & {
  rider: RiderWithExpansionRow | null;
  instance: LessonInstanceWithExpansionRow | null;
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

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
  row: LessonSeriesWithExpansionRow
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
    level: row.level ? toLevel(row.level) : null,
    trainer: toTrainer(row.trainer),
    board: toBoard(row.board),
    service: toService(row.service),
    enrollments: row.enrollments.map(toSeriesEnrollment),
  };
}

export function toLessonInstance(
  row: LessonInstanceWithExpansionRow
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
    level: row.level ? toLevel(row.level) : null,
    trainer: toTrainer(row.trainer),
    board: toBoard(row.board),
    service: toService(row.service),
    series: toLessonSeriesSummary(row.series),
    enrollments: row.enrollments.map(toInstanceEnrollment),
  };
}

export function toSeriesEnrollment(
  row: LessonSeriesEnrollmentWithExpansionRow
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
  row: InstanceEnrollmentWithExpansionRow
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
