import { EventScope, LessonInstanceStatus } from "@instride/shared";
import { and, eq, inArray, not } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { db } from "@/database";
import {
  events,
  eventSchedulingBlocks,
  lessonInstances,
} from "@/database/schema";
import { requireOrganizationAuth } from "@/shared/auth";

import { GetEventResponse } from "./types/contracts";
import { Event } from "./types/models";
import { findAffectedInstances } from "./utils";
import { buildSchedulingBlocks, validateEventScope } from "./utils";

interface UpsertEventRequest {
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  scope: EventScope;
  boardIds?: string[] | null;
  trainerIds?: string[] | null;
  blockScheduling: boolean;
  cancellationReason?: string; // required if blockScheduling is true
}

export const createEvent = api(
  {
    method: "POST",
    path: "/events",
    expose: true,
    auth: true,
  },
  async (request: UpsertEventRequest): Promise<GetEventResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    let newEvent: Event | null = null;

    await db.transaction(async (tx) => {
      validateEventScope(request);

      const [event] = await tx
        .insert(events)
        .values({
          organizationId,
          title: request.title,
          description: request.description,
          startDate: request.startDate,
          endDate: request.endDate,
          startTime: request.startTime,
          endTime: request.endTime,
          blockScheduling: request.blockScheduling,
          createdByMemberId: member.id,
        })
        .returning();

      newEvent = event;

      // Build scheduling blocks
      const blockRows = buildSchedulingBlocks({
        ...request,
        eventId: event.id,
      });

      await tx.insert(eventSchedulingBlocks).values(blockRows);

      if (request.blockScheduling) {
        const instances = await findAffectedInstances({
          DB: tx,
          organizationId,
          window: {
            startDate: request.startDate,
            endDate: request.endDate,
            startTime: request.startTime ?? undefined,
            endTime: request.endTime ?? undefined,
          },
          block: {
            ...request,
            boardIds: request.boardIds ?? [],
            trainerIds: request.trainerIds ?? [],
          },
        });

        if (instances.length > 0) {
          await tx
            .update(lessonInstances)
            .set({
              status: LessonInstanceStatus.CANCELLED,
              canceledAt: new Date(),
              canceledByMemberId: member.id,
              cancelReason: request.cancellationReason,
            })
            .where(
              inArray(
                lessonInstances.id,
                instances.map((instance) => instance.id)
              )
            );
        }
      }
    });

    if (!newEvent) {
      throw APIError.internal("Failed to create event");
    }

    return { event: newEvent };
  }
);

interface UpdateEventRequest extends UpsertEventRequest {
  id: string;
}

export const updateEvent = api(
  {
    method: "PUT",
    path: "/events/:id",
    expose: true,
    auth: true,
  },
  async (request: UpdateEventRequest): Promise<GetEventResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    let updatedEvent: Event | null = null;

    await db.transaction(async (tx) => {
      validateEventScope(request);

      const existingEvent = await tx.query.events.findFirst({
        where: {
          id: request.id,
          organizationId,
        },
        with: {
          schedulingBlocks: true,
        },
      });

      if (!existingEvent) {
        throw APIError.notFound("Event not found");
      }

      const [event] = await tx
        .update(events)
        .set({
          title: request.title,
          description: request.description,
          startDate: request.startDate,
          endDate: request.endDate,
          startTime: request.startTime ?? null,
          endTime: request.endTime ?? null,
        })
        .where(
          and(
            eq(events.id, request.id),
            eq(events.organizationId, organizationId)
          )
        )
        .returning();

      updatedEvent = event;

      validateEventScope(request);

      const blockRows = buildSchedulingBlocks({
        ...request,
        eventId: event.id,
      });

      await tx
        .delete(eventSchedulingBlocks)
        .where(
          and(
            eq(eventSchedulingBlocks.eventId, event.id),
            not(eq(eventSchedulingBlocks.scope, request.scope))
          )
        );

      await tx.insert(eventSchedulingBlocks).values(blockRows);

      if (request.blockScheduling) {
        const instances = await findAffectedInstances({
          DB: tx,
          organizationId,
          window: {
            startDate: request.startDate,
            endDate: request.endDate,
            startTime: request.startTime ?? undefined,
            endTime: request.endTime ?? undefined,
          },
          block: {
            ...request,
            boardIds: request.boardIds ?? [],
            trainerIds: request.trainerIds ?? [],
          },
        });

        if (instances.length > 0) {
          await tx
            .update(lessonInstances)
            .set({
              status: LessonInstanceStatus.CANCELLED,
              canceledAt: new Date(),
              canceledByMemberId: member.id,
              cancelReason: request.cancellationReason,
            })
            .where(
              inArray(
                lessonInstances.id,
                instances.map((instance) => instance.id)
              )
            );
        }
      }
    });

    if (!updatedEvent) {
      throw APIError.internal("Failed to update event");
    }

    return { event: updatedEvent };
  }
);

export const deleteEvent = api(
  { method: "DELETE", path: "/events/:id", expose: true, auth: true },
  async (request: { id: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    const event = await db.query.events.findFirst({
      where: {
        id: request.id,
        organizationId,
      },
    });

    if (!event) throw APIError.notFound("Event not found");

    // cascade on eventSchedulingBlocks handles cleanup
    await db
      .delete(events)
      .where(
        and(
          eq(events.id, request.id),
          eq(events.organizationId, organizationId)
        )
      );
  }
);
