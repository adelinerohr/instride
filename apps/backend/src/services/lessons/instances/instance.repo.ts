import { LessonInstanceStatus } from "@instride/shared";
import { and, eq } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { lessonInstanceExpansion } from "../fragments";
import {
  lessonInstances,
  type LessonInstanceRow,
  type NewLessonInstanceRow,
} from "../schema";
import { publishLessonCreated } from "./publish";

interface CreateInstanceData extends Omit<
  NewLessonInstanceRow,
  "start" | "end"
> {
  start: Date;
  end: Date;
}

export const createLessonInstanceRepo = (
  client: Database | Transaction = db
) => ({
  /**
   * Insert an instance, deduplicated by occurrenceKey. If the row already
   * exists (race / cron retry), returns the existing row with `wasCreated: false`.
   * Pub/sub publishing is the caller's responsibility — see publishLessonCreated.
   */
  upsertByOccurrenceKey: async (data: CreateInstanceData) => {
    const [inserted] = await client
      .insert(lessonInstances)
      .values(data)
      .onConflictDoNothing({ target: lessonInstances.occurrenceKey })
      .returning();

    const wasCreated = !!inserted;

    const instance = await client.query.lessonInstances.findFirst({
      where: { occurrenceKey: data.occurrenceKey },
      with: lessonInstanceExpansion,
    });
    assertExists(instance, "Failed to load instance after upsert");

    return { instance, wasCreated };
  },

  findOne: async (id: string, organizationId: string) => {
    const instance = await client.query.lessonInstances.findFirst({
      where: { id, organizationId },
    });
    assertExists(instance, "Lesson instance not found");
    return instance;
  },

  findBySeries: async (seriesId: string, organizationId: string) => {
    return await client.query.lessonInstances.findMany({
      where: { seriesId, organizationId },
    });
  },

  findOneExpanded: async (id: string, organizationId: string) => {
    const instance = await client.query.lessonInstances.findFirst({
      where: { id, organizationId },
      with: lessonInstanceExpansion,
    });
    assertExists(instance, "Lesson instance not found");
    return instance;
  },

  findMany: async (params: {
    organizationId: string;
    filters?: {
      range?: {
        from: Date;
        to: Date;
      };
      boardId?: string;
      trainerId?: string;
      status?: LessonInstanceStatus;
    };
  }) => {
    const { organizationId, filters } = params;
    const instances = await client.query.lessonInstances.findMany({
      where: {
        organizationId,
        ...(filters?.range
          ? { start: { gte: filters.range.from, lte: filters.range.to } }
          : {}),
        ...(filters?.boardId && { boardId: filters.boardId }),
        ...(filters?.trainerId && { trainerId: filters.trainerId }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { start: "asc" },
      with: lessonInstanceExpansion,
    });
    assertExists(instances, "Failed to load instances");
    return instances;
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<LessonInstanceRow>
  ) => {
    const [instance] = await client
      .update(lessonInstances)
      .set({ ...data, ...(data.start && { start: new Date(data.start) }) })
      .where(
        and(
          eq(lessonInstances.id, id),
          eq(lessonInstances.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(instance, "Lesson instance not found");
    return instance;
  },

  cancel: async (
    id: string,
    organizationId: string,
    request: { canceledByMemberId: string; reason: string | null }
  ) => {
    const [canceled] = await client
      .update(lessonInstances)
      .set({
        status: LessonInstanceStatus.CANCELLED,
        canceledAt: new Date(),
        cancelReason: request.reason,
        canceledByMemberId: request.canceledByMemberId,
      })
      .where(
        and(
          eq(lessonInstances.id, id),
          eq(lessonInstances.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(canceled, "Lesson instance not found");
    return canceled;
  },
});

export const lessonInstanceRepo = createLessonInstanceRepo();

/**
 * Create-or-fetch with pub/sub publish on first creation. Single entrypoint
 * used by HTTP endpoint and scheduler. Caller decides whether to publish.
 */
export async function createInstanceWithPublish(input: {
  organizationId: string;
  createdByMemberId: string | null;
  seriesId: string;
  boardId: string;
  trainerId: string;
  serviceId: string;
  maxRiders: number;
  occurrenceKey: string;
  start: string | Date;
  end: string | Date;
  name?: string | null;
  levelId?: string | null;
  notes?: string | null;
}) {
  const result = await db.transaction(async (tx) => {
    return await createLessonInstanceRepo(tx).upsertByOccurrenceKey({
      organizationId: input.organizationId,
      seriesId: input.seriesId,
      boardId: input.boardId,
      trainerId: input.trainerId,
      serviceId: input.serviceId,
      levelId: input.levelId ?? null,
      name: input.name ?? null,
      notes: input.notes ?? null,
      maxRiders: input.maxRiders,
      occurrenceKey: input.occurrenceKey,
      start: input.start instanceof Date ? input.start : new Date(input.start),
      end: input.end instanceof Date ? input.end : new Date(input.end),
      status: LessonInstanceStatus.SCHEDULED,
      createdByMemberId: input.createdByMemberId,
    });
  });

  if (result.wasCreated) {
    await publishLessonCreated(result.instance);
  }

  return result;
}
