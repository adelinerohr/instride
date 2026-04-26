import { LessonInstanceStatus } from "@instride/shared";
import { and, eq, inArray, not } from "drizzle-orm";

import { lessonInstances } from "@/services/lessons/schema";
import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { eventExpansion } from "./fragments";
import {
  events,
  eventSchedulingBlocks,
  type EventRow,
  type NewEventRow,
  type NewEventSchedulingBlockRow,
} from "./schema";

export const createEventService = (client: Database | Transaction = db) => ({
  create: async (data: NewEventRow) => {
    const [event] = await client.insert(events).values(data).returning();
    assertExists(event, "Failed to create event");
    return event;
  },

  findOne: async (id: string, organizationId: string) => {
    const event = await client.query.events.findFirst({
      where: { id, organizationId },
      with: eventExpansion,
    });
    assertExists(event, "Event not found");
    return event;
  },

  findManyInRange: async (params: {
    organizationId: string;
    from: string;
    to: string;
  }) => {
    return await client.query.events.findMany({
      where: {
        organizationId: params.organizationId,
        startDate: { lte: params.to },
        endDate: { gte: params.from },
      },
      with: eventExpansion,
    });
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<EventRow>
  ) => {
    const [event] = await client
      .update(events)
      .set(data)
      .where(and(eq(events.id, id), eq(events.organizationId, organizationId)))
      .returning();
    assertExists(event, "Event not found");
    return event;
  },

  delete: async (id: string, organizationId: string) => {
    // Cascade on event_scheduling_blocks handles cleanup
    await client
      .delete(events)
      .where(and(eq(events.id, id), eq(events.organizationId, organizationId)));
  },

  // ============================================================================
  // Scheduling blocks
  // ============================================================================

  insertSchedulingBlocks: async (rows: NewEventSchedulingBlockRow[]) => {
    if (rows.length === 0) return;
    await client.insert(eventSchedulingBlocks).values(rows);
  },

  /** Delete blocks whose scope no longer matches — used when scope changes on update. */
  deleteSchedulingBlocksNotMatchingScope: async (params: {
    eventId: string;
    keepScope: string; // EventScope value
  }) => {
    await client
      .delete(eventSchedulingBlocks)
      .where(
        and(
          eq(eventSchedulingBlocks.eventId, params.eventId),
          not(eq(eventSchedulingBlocks.scope, params.keepScope as never))
        )
      );
  },

  deleteAllSchedulingBlocks: async (eventId: string) => {
    await client
      .delete(eventSchedulingBlocks)
      .where(eq(eventSchedulingBlocks.eventId, eventId));
  },

  // ============================================================================
  // Affected instances (used by both event mutations and the public endpoint)
  // ============================================================================

  cancelAffectedInstances: async (params: {
    instanceIds: string[];
    canceledByMemberId: string;
    cancelReason: string | null;
  }) => {
    if (params.instanceIds.length === 0) return;
    await client
      .update(lessonInstances)
      .set({
        status: LessonInstanceStatus.CANCELLED,
        canceledAt: new Date(),
        canceledByMemberId: params.canceledByMemberId,
        cancelReason: params.cancelReason,
      })
      .where(inArray(lessonInstances.id, params.instanceIds));
  },
});

export const eventService = createEventService();
