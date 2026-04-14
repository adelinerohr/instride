import {
  DayOfWeek,
  LessonInstanceStatus,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "@instride/shared/models/enums";
import { addWeeks } from "date-fns";
import { and, eq, gte } from "drizzle-orm";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { enrollInSeries } from "../enrollments/post";
import { generateLessonInstances } from "../scheduler/generate";
import { lessonInstances, lessonSeries } from "../schema";
import { GetLessonSeriesResponse } from "../types/contracts";

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

    const [series] = await db
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

    if (request.riderIds) {
      await enrollInSeries({
        seriesId: series.id,
        riderIds: request.riderIds,
        startDate: request.start,
        endDate: null,
      });
    }

    await generateLessonInstances({
      seriesId: series.id,
      until: addWeeks(new Date(), 4),
    });

    return { series };
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
    const { member } = await organizations.getMember();

    const [series] = await db
      .update(lessonSeries)
      .set({
        ...request,
        start: new Date(request.start),
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
      })
      .where(eq(lessonSeries.id, request.id))
      .returning();

    if (request.riderIds) {
      await enrollInSeries({
        seriesId: series.id,
        riderIds: request.riderIds,
        startDate: request.start,
        endDate: null,
      });
    }

    return { series };
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
    const { member } = await organizations.getMember();

    await db
      .update(lessonSeries)
      .set({
        status: LessonSeriesStatus.CANCELLED,
        updatedByMemberId: member.id,
      })
      .where(eq(lessonSeries.id, request.id));

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
          gte(lessonInstances.start, now)
        )
      );
  }
);
