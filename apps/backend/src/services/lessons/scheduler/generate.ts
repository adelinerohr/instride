import { addMinutes, format } from "date-fns";
import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";

import {
  lessonInstanceEnrollments,
  lessonInstances,
  lessonSeries,
} from "../schema";
import { lessonCreated, lessonEnrolled } from "../topics";
import { LessonInstance } from "../types/models";

interface GenerateLessonInstancesRequest {
  seriesId: string;
  until: Date;
}

/**
 * Generates lesson instances for a given lesson series up to a given date.
 * @param series - The lesson series to generate instances for.
 * @param until - The date up to which to generate instances.
 */
export const generateLessonInstances = api(
  {
    method: "POST",
    path: "/lessons/scheduler/generate",
    auth: true,
  },
  async ({
    seriesId,
    until,
  }: GenerateLessonInstancesRequest): Promise<void> => {
    const series = await db.query.lessonSeries.findFirst({
      where: { id: seriesId },
      with: {
        trainer: {
          with: {
            member: {
              with: {
                authUser: true,
              },
            },
          },
        },
      },
    });

    if (!series) {
      throw new Error("Series not found");
    }

    const startFrom = series.lastPlannedUntil
      ? new Date(series.lastPlannedUntil)
      : new Date(series.start);
    const start = new Date(series.start);

    const instances: Array<{
      organizationId: string;
      seriesId: string;
      boardId: string;
      trainerId: string;
      levelId: string | null;
      serviceId: string;
      start: Date;
      end: Date;
      maxRiders: number;
      occurrenceKey: string;
      name: string | null;
      notes: string | null;
    }> = [];

    if (!series.isRecurring) {
      // One-off lesson — just one instance at the series start time
      const key = `standalone:${series.id}`;
      const existing = await db.query.lessonInstances.findFirst({
        where: {
          occurrenceKey: key,
        },
      });

      if (!existing) {
        instances.push({
          organizationId: series.organizationId,
          seriesId: series.id,
          boardId: series.boardId,
          trainerId: series.trainerId,
          levelId: series.levelId ?? null,
          maxRiders: series.maxRiders,
          serviceId: series.serviceId,
          start: new Date(series.start),
          end: addMinutes(new Date(series.start), series.duration),
          occurrenceKey: key,
          name: series.name ?? null,
          notes: series.notes ?? null,
        });
      }
    } else {
      // Recurring weekly — same day-of-week as series.start, same time
      const recurrenceEndDate = series.recurrenceEnd
        ? new Date(series.recurrenceEnd)
        : null;
      const effectiveUntil =
        recurrenceEndDate && recurrenceEndDate < until
          ? recurrenceEndDate
          : until;

      // Start from the first occurrence on-or-after startFrom
      // that falls on the same weekday as series.start
      const targetDay = new Date(series.start).getDay();
      const current = new Date(startFrom);
      current.setHours(0, 0, 0, 0);

      // Advance to the next occurrence of targetDay
      const daysUntilTarget = (targetDay - current.getDay() + 7) % 7;
      if (daysUntilTarget > 0) {
        current.setDate(current.getDate() + daysUntilTarget);
      }

      while (current <= effectiveUntil) {
        const instanceStart = new Date(current);
        instanceStart.setHours(start.getHours(), start.getMinutes(), 0, 0);

        if (instanceStart >= new Date()) {
          const dateStr = format(current, "yyyy-MM-dd");
          const key = `${series.id}:${dateStr}`;

          const existing = await db
            .select()
            .from(lessonInstances)
            .where(eq(lessonInstances.occurrenceKey, key))
            .limit(1);

          if (existing.length === 0) {
            instances.push({
              organizationId: series.organizationId,
              seriesId: series.id,
              boardId: series.boardId,
              trainerId: series.trainerId,
              levelId: series.levelId ?? null,
              serviceId: series.serviceId,
              start: instanceStart,
              end: addMinutes(instanceStart, series.duration),
              maxRiders: series.maxRiders,
              occurrenceKey: key,
              name: series.name ?? null,
              notes: series.notes ?? null,
            });
          }
        }

        // Jump 7 days instead of iterating day-by-day
        current.setDate(current.getDate() + 7);
      }
    }

    let newInstances: LessonInstance[] = [];

    if (instances.length > 0) {
      const insertedInstances = await db
        .insert(lessonInstances)
        .values(instances)
        .onConflictDoNothing()
        .returning();
      newInstances = insertedInstances;
    }

    // Publish lesson created event
    await Promise.allSettled(
      newInstances.map((instance) =>
        lessonCreated.publish({
          instanceId: instance.id,
          seriesId: series.id,
          organizationId: series.organizationId,
          trainerId: series.trainerId,
          trainerMemberId: series.trainer?.memberId ?? "",
          trainerName: series.trainer?.member?.authUser?.name ?? "",
          boardId: series.boardId,
          serviceId: series.serviceId,
          levelId: series.levelId ?? null,
          startTime: instance.start.toISOString(),
          endTime: instance.end.toISOString(),
          maxRiders: instance.maxRiders,
          name: instance.name,
          isRecurring: series.isRecurring,
        })
      )
    );

    await db
      .update(lessonSeries)
      .set({ lastPlannedUntil: until })
      .where(eq(lessonSeries.id, series.id));

    if (newInstances.length > 0) {
      const activeSeriesEnrollments =
        await db.query.lessonSeriesEnrollments.findMany({
          where: {
            seriesId: series.id,
            status: "active",
          },
          with: {
            rider: {
              with: {
                member: {
                  with: {
                    authUser: true,
                  },
                },
              },
            },
          },
        });

      if (activeSeriesEnrollments.length > 0) {
        const instanceEnrollments = newInstances.flatMap((instance) =>
          activeSeriesEnrollments.map((se) => ({
            organizationId: series.organizationId,
            instanceId: instance.id,
            riderId: se.riderId,
            enrolledByMemberId: se.enrolledByMemberId,
          }))
        );

        await db
          .insert(lessonInstanceEnrollments)
          .values(instanceEnrollments)
          .onConflictDoNothing();

        // ✅ PUBLISH ENROLLMENT EVENTS
        await Promise.allSettled(
          newInstances.flatMap((instance) =>
            activeSeriesEnrollments.map((enrollment) =>
              lessonEnrolled.publish({
                instanceId: instance.id,
                seriesId: series.id,
                organizationId: series.organizationId,
                riderId: enrollment.riderId,
                riderMemberId: enrollment.rider?.memberId ?? "",
                riderName: enrollment.rider?.member?.authUser?.name ?? "",
                enrolledByMemberId: enrollment.enrolledByMemberId ?? "",
                trainerId: series.trainerId,
                trainerMemberId: series.trainer?.memberId ?? "",
                trainerName: series.trainer?.member?.authUser?.name ?? "",
                startTime: instance.start.toISOString(),
                endTime: instance.end.toISOString(),
                lessonName: instance.name,
              })
            )
          )
        );
      }
    }
  }
);
