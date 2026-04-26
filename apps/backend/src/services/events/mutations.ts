import type {
  GetEventResponse,
  UpdateEventRequest,
  UpsertEventRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "./db";
import { eventService, createEventService } from "./event.service";
import { toEvent } from "./mappers";
import {
  buildSchedulingBlocks,
  findAffectedInstances,
  validateEventScope,
} from "./utils";

export const createEvent = api(
  { method: "POST", path: "/events", expose: true, auth: true },
  async (request: UpsertEventRequest): Promise<GetEventResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    validateEventScope(request);

    const eventId = await db.transaction(async (tx) => {
      const txService = createEventService(tx);

      const created = await txService.create({
        organizationId,
        title: request.title,
        description: request.description ?? null,
        startDate: request.startDate,
        endDate: request.endDate,
        startTime: request.startTime ?? null,
        endTime: request.endTime ?? null,
        blockScheduling: request.blockScheduling,
        createdByMemberId: member.id,
      });

      await txService.insertSchedulingBlocks(
        buildSchedulingBlocks({
          scope: request.scope,
          boardIds: request.boardIds,
          trainerIds: request.trainerIds,
          eventId: created.id,
        })
      );

      if (request.blockScheduling) {
        const instances = await findAffectedInstances(tx, {
          organizationId,
          window: request,
        });

        await txService.cancelAffectedInstances({
          instanceIds: instances.map((i) => i.id),
          canceledByMemberId: member.id,
          cancelReason: request.cancellationReason ?? null,
        });
      }

      return created.id;
    });

    const row = await eventService.findOne(eventId, organizationId);
    return { event: toEvent(row) };
  }
);

export const updateEvent = api(
  { method: "PUT", path: "/events/:id", expose: true, auth: true },
  async (request: UpdateEventRequest): Promise<GetEventResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    validateEventScope(request);

    await db.transaction(async (tx) => {
      const txService = createEventService(tx);

      // Confirms the event exists in this org; throws 404 otherwise
      await txService.findOne(request.id, organizationId);

      await txService.update(request.id, organizationId, {
        title: request.title,
        description: request.description ?? null,
        startDate: request.startDate,
        endDate: request.endDate,
        startTime: request.startTime ?? null,
        endTime: request.endTime ?? null,
        blockScheduling: request.blockScheduling,
      });

      // Replace all scheduling blocks. Simpler than diffing — small list,
      // cascades clean up. The original code tried to preserve blocks that
      // matched the new scope, but it didn't actually work cleanly because
      // it inserted new blocks even when the existing ones matched.
      await txService.deleteAllSchedulingBlocks(request.id);
      await txService.insertSchedulingBlocks(
        buildSchedulingBlocks({
          scope: request.scope,
          boardIds: request.boardIds,
          trainerIds: request.trainerIds,
          eventId: request.id,
        })
      );

      if (request.blockScheduling) {
        const instances = await findAffectedInstances(tx, {
          organizationId,
          window: request,
        });

        await txService.cancelAffectedInstances({
          instanceIds: instances.map((i) => i.id),
          canceledByMemberId: member.id,
          cancelReason: request.cancellationReason ?? null,
        });
      }
    });

    const row = await eventService.findOne(request.id, organizationId);
    return { event: toEvent(row) };
  }
);

export const deleteEvent = api(
  { method: "DELETE", path: "/events/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    // findOne enforces "exists in this org" — throws 404 otherwise
    await eventService.findOne(id, organizationId);
    await eventService.delete(id, organizationId);
  }
);
