import {
  DayOfWeek,
  LessonInstanceStatus,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "@instride/shared";
import { addWeeks } from "date-fns";
import { and, eq, gte } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { generateLessonInstances } from "../scheduler/generate";
import { lessonInstances, lessonSeries } from "../schema";
import { GetLessonSeriesResponse } from "../types/contracts";
import { checkLessonAvailability } from "../utils/availability";
import { syncSeriesEnrollments } from "./utils";

interface CreateLessonSeriesRequest {
  duration: number;
  boardId: string;
  maxRiders: number;
  serviceId: string;
  trainerId: string;
  start: string;
  name?: string | null;
  status?: LessonSeriesStatus;
  levelId?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency | null;
  recurrenceByDay?: DayOfWeek[] | null;
  recurrenceEnd?: string | null;
  effectiveFrom?: string | null;
  lastPlannedUntil?: string | null;
  updatedByMemberId?: string | null;
  riderIds?: string[];
  overrideAvailability?: boolean;
}

export const createLessonSeries = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/series",
    auth: true,
  },
  async (
    request: CreateLessonSeriesRequest
  ): Promise<GetLessonSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const violations = request.overrideAvailability
      ? []
      : await checkLessonAvailability({
          organizationId,
          window: {
            date: request.start,
            startTime: request.start,
            endTime: request.start + request.duration,
            trainerId: request.trainerId,
            boardId: request.boardId,
          },
        });

    if (violations.length > 0) {
      throw APIError.invalidArgument(
        "Lesson conflicts with existing schedule"
      ).withDetails({
        violations,
      });
    }

    const series = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(lessonSeries)
        .values({
          organizationId,
          boardId: request.boardId,
          trainerId: request.trainerId,
          serviceId: request.serviceId,
          start: new Date(request.start),
          duration: request.duration,
          maxRiders: request.maxRiders,
          levelId: request.levelId ?? null,
          name: request.name ?? null,
          notes: request.notes ?? null,
          isRecurring: request.isRecurring ?? false,
          recurrenceEnd: request.recurrenceEnd
            ? new Date(request.recurrenceEnd)
            : null,
          createdByMemberId: member.id,
        })
        .returning();

      if (request.riderIds && request.riderIds.length > 0) {
        await syncSeriesEnrollments({
          tx,
          organizationId,
          seriesId: created.id,
          riderIds: request.riderIds,
          memberId: member.id,
          startDate: request.start,
          endDate: null,
        });
      }

      return created;
    });

    await generateLessonInstances({
      seriesId: series.id,
      until: addWeeks(new Date(), 4),
    });

    return series;
  }
);

interface UpdateLessonSeriesRequest extends CreateLessonSeriesRequest {
  id: string;
  effectiveFrom?: string | null;
}

export const updateLessonSeries = api(
  {
    expose: true,
    method: "PUT",
    path: "/lessons/series/:id",
    auth: true,
  },
  async (
    request: UpdateLessonSeriesRequest
  ): Promise<GetLessonSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const series = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(lessonSeries)
        .set({
          boardId: request.boardId,
          trainerId: request.trainerId,
          serviceId: request.serviceId,
          start: new Date(request.start),
          duration: request.duration,
          maxRiders: request.maxRiders,
          name: request.name ?? null,
          status: request.status,
          levelId: request.levelId ?? null,
          notes: request.notes ?? null,
          isRecurring: request.isRecurring ?? false,
          recurrenceFrequency: request.recurrenceFrequency ?? null,
          recurrenceByDay: request.recurrenceByDay ?? null,
          recurrenceEnd: request.recurrenceEnd
            ? new Date(request.recurrenceEnd)
            : null,
          effectiveFrom: request.effectiveFrom
            ? new Date(request.effectiveFrom)
            : null,
          lastPlannedUntil: request.lastPlannedUntil
            ? new Date(request.lastPlannedUntil)
            : null,
          updatedByMemberId: member.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lessonSeries.id, request.id),
            eq(lessonSeries.organizationId, organizationId)
          )
        )
        .returning();

      if (!updated) {
        throw APIError.notFound("Lesson series not found");
      }

      if (request.riderIds) {
        await syncSeriesEnrollments({
          tx,
          organizationId,
          seriesId: updated.id,
          riderIds: request.riderIds,
          memberId: member.id,
          startDate: request.start,
          endDate: null,
        });
      }

      return updated;
    });

    return series;
  }
);

interface CancelLessonSeriesRequest {
  id: string;
  reason?: string;
}

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

    await db
      .update(lessonSeries)
      .set({
        status: LessonSeriesStatus.CANCELLED,
        updatedByMemberId: member.id,
      })
      .where(
        and(
          eq(lessonSeries.id, request.id),
          eq(lessonSeries.organizationId, organizationId)
        )
      );

    // Cancel all future instances
    const now = new Date();
    await db
      .update(lessonInstances)
      .set({
        status: LessonInstanceStatus.CANCELLED,
        canceledAt: now,
        canceledByMemberId: member.id,
        cancelReason: request.reason ?? null,
      })
      .where(
        and(
          eq(lessonInstances.seriesId, request.id),
          eq(lessonInstances.organizationId, organizationId),
          gte(lessonInstances.start, now)
        )
      );
  }
);
