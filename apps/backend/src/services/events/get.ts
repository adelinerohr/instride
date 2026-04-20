import { EventScope } from "@instride/shared";
import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { ListLessonInstancesResponse } from "../lessons/types/contracts";
import { db } from "./db";
import { GetEventResponse, ListEventsResponse } from "./types/contracts";
import { findAffectedInstances, getEventResponse } from "./utils";

interface GetAffectedInstancesRequest {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  scope: EventScope;
  boardIds?: string[];
  trainerIds?: string[];
}

export const getAffectedInstances = api(
  {
    method: "GET",
    path: "/events/affected-instances",
    expose: true,
    auth: true,
  },
  async (
    request: GetAffectedInstancesRequest
  ): Promise<ListLessonInstancesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const instances = await findAffectedInstances({
      DB: db,
      organizationId,
      window: request,
      block: request,
    });

    return { instances };
  }
);

interface ListEventsRequest {
  from: string;
  to: string;
}

export const listEvents = api(
  {
    method: "GET",
    path: "/events",
    expose: true,
    auth: true,
  },
  async (request: ListEventsRequest): Promise<ListEventsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const events = await db.query.events.findMany({
      where: {
        organizationId,
        startDate: {
          lte: request.to,
        },
        endDate: {
          gte: request.from,
        },
      },
      with: {
        schedulingBlocks: true,
      },
    });

    const responseEvents = events.map(getEventResponse);

    return { events: responseEvents };
  }
);

export const getEvent = api(
  {
    method: "GET",
    path: "/events/:id",
    expose: true,
    auth: true,
  },
  async (input: { id: string }): Promise<GetEventResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const event = await db.query.events.findFirst({
      where: {
        organizationId,
        id: input.id,
      },
      with: {
        schedulingBlocks: true,
      },
    });

    if (!event) {
      throw APIError.notFound("Event not found");
    }

    return getEventResponse(event);
  }
);
