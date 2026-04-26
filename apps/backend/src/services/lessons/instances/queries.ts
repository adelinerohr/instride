import type {
  GetLessonInstanceResponse,
  ListLessonInstancesRequest,
  ListLessonInstancesResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { toLessonInstance } from "../mappers";
import { lessonInstanceService } from "./instance.service";

export const listLessonInstances = api(
  { expose: true, method: "GET", path: "/lessons/instances", auth: true },
  async (
    request: ListLessonInstancesRequest
  ): Promise<ListLessonInstancesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows = await lessonInstanceService.findMany({
      organizationId,
      filters: {
        range: {
          from: new Date(request.from),
          to: new Date(request.to),
        },
        boardId: request.boardId,
        trainerId: request.trainerId,
        status: request.status,
      },
    });

    return { instances: rows.map(toLessonInstance) };
  }
);

export const getLessonInstance = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/instances/:id",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetLessonInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const instance = await lessonInstanceService.findOneExpanded(
      id,
      organizationId
    );
    return { instance: toLessonInstance(instance) };
  }
);
