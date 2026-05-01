import type {
  CancelLessonSeriesRequest,
  CreateLessonSeriesRequest,
  CreateLessonSeriesResponse,
  UpdateLessonSeriesRequest,
  UpdateLessonSeriesResponse,
  SkippedInstance,
} from "@instride/api/contracts";
import { addWeeks } from "date-fns";
import { and, eq, gte } from "drizzle-orm";
import { appMeta } from "encore.dev";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { checkLessonAvailability } from "@/services/availability/scheduling/check-availability";
import { buildAvailabilityWindow } from "@/services/availability/scheduling/windows";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { toLessonSeries } from "../mappers";
import { generateInstancesForSeries } from "../scheduler/generate";
import { lessonInstances, LessonSeriesRow } from "../schema";
import { syncSeriesEnrollments } from "./enrollment-sync";
import {
  createLessonSeriesService,
  lessonSeriesService,
} from "./series.service";

function getWindowWeeks(): number {
  return appMeta().environment.type === "production" ? 12 : 4;
}

export const createLessonSeries = api(
  { expose: true, method: "POST", path: "/lessons/series", auth: true },
  async (
    request: CreateLessonSeriesRequest
  ): Promise<CreateLessonSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const organization = await db.query.organizations.findFirst({
      where: { id: organizationId },
    });
    assertExists(organization, "Organization not found");

    const { window, startDate } = buildAvailabilityWindow({
      start: request.start,
      duration: request.duration,
      trainerId: request.trainerId,
      boardId: request.boardId,
      timeZone: organization.timezone,
    });

    if (!request.overrideAvailability) {
      const violations = await checkLessonAvailability({
        organizationId,
        window,
      });
      if (violations.length > 0) {
        throw APIError.invalidArgument(
          "Lesson conflicts with existing schedule"
        ).withDetails({ violations });
      }
    }

    // Phase 1: persist the series + sync enrollments in a transaction
    const seriesId = await db.transaction(async (tx) => {
      const created = await createLessonSeriesService(tx).create({
        organizationId,
        boardId: request.boardId,
        trainerId: request.trainerId,
        serviceId: request.serviceId,
        start: startDate,
        duration: request.duration,
        maxRiders: request.maxRiders,
        levelId: request.levelId ?? null,
        name: request.name ?? null,
        notes: request.notes ?? null,
        isRecurring: request.isRecurring ?? false,
        recurrenceFrequency: request.recurrenceFrequency ?? null,
        recurrenceByDay: request.recurrenceByDay ?? null,
        recurrenceEnd: request.recurrenceEnd
          ? new Date(request.recurrenceEnd)
          : null,
        createdByMemberId: request.createdByMemberId ?? member.id,
      });

      if (request.riderIds && request.riderIds.length > 0) {
        await syncSeriesEnrollments({
          client: tx,
          organizationId,
          seriesId: created.id,
          riderIds: request.riderIds,
          memberId: member.id,
          startDate: request.start,
          endDate: null,
        });
      }

      return created.id;
    });

    // Phase 2: materialize instances. Outside the transaction because it
    // does its own per-occurrence transactions and pub/sub publishes.
    const generation = await generateInstancesForSeries({
      seriesId,
      until: addWeeks(new Date(), getWindowWeeks()),
      createdByMemberId: request.createdByMemberId ?? member.id,
    });

    const series = await lessonSeriesService.findOneFull(
      seriesId,
      organizationId
    );
    assertExists(series, "Failed to load series after create");

    return {
      series: toLessonSeries(series),
      skipped: generation.skipped,
    };
  }
);

export const cancelLessonSeries = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/series/:id/cancel",
    auth: true,
  },
  async (request: CancelLessonSeriesRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    await lessonSeriesService.cancel({
      id: request.id,
      organizationId,
      canceledByMemberId: member.id,
      reason: request.reason ?? null,
    });
  }
);

/**
 * Fields whose change triggers regeneration of future instances.
 * If any of these are modified, future un-attended/un-cancelled instances
 * are dropped and rebuilt from the updated series. Past instances stay intact.
 */
const SCHEDULING_FIELDS: Array<keyof UpdateLessonSeriesRequest> = [
  "start",
  "duration",
  "trainerId",
  "boardId",
  "serviceId",
  "levelId",
  "isRecurring",
  "recurrenceFrequency",
  "recurrenceByDay",
  "recurrenceEnd",
];

/**
 * Fields whose change triggers an availability recheck (subset of the above).
 * `levelId`/`serviceId` don't need a recheck — they don't move time on the calendar.
 */
const AVAILABILITY_AFFECTING_FIELDS: Array<keyof UpdateLessonSeriesRequest> = [
  "start",
  "duration",
  "trainerId",
  "boardId",
  "isRecurring",
  "recurrenceFrequency",
  "recurrenceByDay",
  "recurrenceEnd",
];

export const updateLessonSeries = api(
  { expose: true, method: "PUT", path: "/lessons/series/:id", auth: true },
  async (
    request: UpdateLessonSeriesRequest
  ): Promise<UpdateLessonSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const organization = await db.query.organizations.findFirst({
      where: { id: organizationId },
    });
    assertExists(organization, "Organization not found");

    // Existing series + tenancy check
    const existing = await lessonSeriesService.findOneScalar(
      request.id,
      organizationId
    );

    if (existing.status === "cancelled") {
      throw APIError.failedPrecondition(
        "Cannot update a cancelled lesson series"
      );
    }

    // Determine what kind of change this is
    const schedulingChanged = SCHEDULING_FIELDS.some(
      (field) => request[field] !== undefined
    );
    const availabilityCheckNeeded = AVAILABILITY_AFFECTING_FIELDS.some(
      (field) => request[field] !== undefined
    );

    // Resolve effective values (request overrides, otherwise existing)
    const effective = {
      start: request.start ?? existing.start.toISOString(),
      duration: request.duration ?? existing.duration,
      trainerId: request.trainerId ?? existing.trainerId,
      boardId: request.boardId ?? existing.boardId,
    };

    // Availability recheck if any time-shape field changed
    if (availabilityCheckNeeded && !request.overrideAvailability) {
      const { window } = buildAvailabilityWindow({
        start: effective.start,
        duration: effective.duration,
        trainerId: effective.trainerId,
        boardId: effective.boardId,
        timeZone: organization.timezone,
      });

      const violations = await checkLessonAvailability({
        organizationId,
        window,
        // Exclude this series's own future instances from conflict detection,
        // since we'll be regenerating them anyway.
        excludeSeriesId: request.id,
      });
      if (violations.length > 0) {
        throw APIError.invalidArgument(
          "Lesson conflicts with existing schedule"
        ).withDetails({ violations });
      }
    }

    // Phase 1: persist update + sync enrollments + (if needed) cancel future instances
    await db.transaction(async (tx) => {
      const updateData: Partial<LessonSeriesRow> = {
        ...(request.name !== undefined && { name: request.name }),
        ...(request.notes !== undefined && { notes: request.notes }),
        ...(request.maxRiders !== undefined && {
          maxRiders: request.maxRiders,
        }),
        ...(request.start !== undefined && { start: new Date(request.start) }),
        ...(request.duration !== undefined && { duration: request.duration }),
        ...(request.isRecurring !== undefined && {
          isRecurring: request.isRecurring,
        }),
        ...(request.recurrenceFrequency !== undefined && {
          recurrenceFrequency: request.recurrenceFrequency,
        }),
        ...(request.recurrenceByDay !== undefined && {
          recurrenceByDay: request.recurrenceByDay,
        }),
        ...(request.recurrenceEnd !== undefined && {
          recurrenceEnd: request.recurrenceEnd
            ? new Date(request.recurrenceEnd)
            : null,
        }),
        ...(request.trainerId !== undefined && {
          trainerId: request.trainerId,
        }),
        ...(request.boardId !== undefined && { boardId: request.boardId }),
        ...(request.serviceId !== undefined && {
          serviceId: request.serviceId,
        }),
        ...(request.levelId !== undefined && { levelId: request.levelId }),
        updatedByMemberId: member.id,
      };

      await createLessonSeriesService(tx).update(
        request.id,
        organizationId,
        updateData
      );

      // maxRiders also propagates onto FUTURE instances (so existing snapshots stay
      // consistent with the new series capacity going forward).
      if (request.maxRiders !== undefined) {
        await tx
          .update(lessonInstances)
          .set({ maxRiders: request.maxRiders })
          .where(
            and(
              eq(lessonInstances.seriesId, request.id),
              eq(lessonInstances.organizationId, organizationId),
              gte(lessonInstances.start, new Date())
            )
          );
      }

      // Sync enrollments if the caller passed a rider list
      if (request.riderIds !== undefined) {
        await syncSeriesEnrollments({
          client: tx,
          organizationId,
          seriesId: request.id,
          riderIds: request.riderIds,
          memberId: member.id,
          startDate: effective.start,
          endDate: null,
        });
      }

      // If scheduling fields changed, drop future instances. The scheduler
      // pass below regenerates them. Past + completed/cancelled instances stay.
      if (schedulingChanged) {
        await tx
          .delete(lessonInstances)
          .where(
            and(
              eq(lessonInstances.seriesId, request.id),
              eq(lessonInstances.organizationId, organizationId),
              gte(lessonInstances.start, new Date()),
              eq(lessonInstances.status, "scheduled")
            )
          );
      }
    });

    // Phase 2: regenerate future instances if scheduling changed.
    // Outside the transaction because generation publishes pub/sub events
    // and runs its own per-occurrence transactions.
    let skipped: SkippedInstance[] = [];
    if (schedulingChanged) {
      const generation = await generateInstancesForSeries({
        seriesId: request.id,
        until: addWeeks(new Date(), getWindowWeeks()),
        createdByMemberId: member.id,
      });
      skipped = generation.skipped;
    }

    const series = await lessonSeriesService.findOneFull(
      request.id,
      organizationId
    );
    assertExists(series, "Failed to load series after update");

    return {
      series: toLessonSeries(series),
      skipped,
      regenerated: schedulingChanged,
    };
  }
);
