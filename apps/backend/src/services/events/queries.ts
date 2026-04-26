import type {
  GetAffectedInstancesRequest,
  GetEventResponse,
  ListAffectedInstancesResponse,
  ListEventsRequest,
  ListEventsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "./db";
import { eventService } from "./event.service";
import { toEvent } from "./mappers";
import { findAffectedInstances } from "./utils";

export const listEvents = api(
  { method: "GET", path: "/events", expose: true, auth: true },
  async (request: ListEventsRequest): Promise<ListEventsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows = await eventService.findManyInRange({
      organizationId,
      from: request.from,
      to: request.to,
    });

    return { events: rows.map(toEvent) };
  }
);

export const getEvent = api(
  { method: "GET", path: "/events/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<GetEventResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const row = await eventService.findOne(id, organizationId);
    return { event: toEvent(row) };
  }
);

export const getAffectedInstances = api(
  {
    method: "GET",
    path: "/events/affected-instances",
    expose: true,
    auth: true,
  },
  async (
    request: GetAffectedInstancesRequest
  ): Promise<ListAffectedInstancesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const instances = await findAffectedInstances(db, {
      organizationId,
      window: request,
    });

    return {
      instances: instances.map((i) => ({
        id: i.id,
        start: i.start,
        end: i.end,
        trainerId: i.trainerId,
        boardId: i.boardId,
        name: i.name,
      })),
    };
  }
);
