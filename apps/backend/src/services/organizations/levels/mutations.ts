// level/post.ts
import type {
  CreateLevelRequest,
  GetLevelResponse,
  UpdateLevelRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { levelService } from "./level.service";

export const createLevel = api(
  { expose: true, method: "POST", path: "/levels", auth: true },
  async (request: CreateLevelRequest): Promise<GetLevelResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const level = await levelService.create({
      organizationId,
      ...request,
    });
    return { level };
  }
);

export const updateLevel = api(
  { expose: true, method: "PUT", path: "/levels/:id", auth: true },
  async (request: UpdateLevelRequest): Promise<GetLevelResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { id, ...data } = request;

    const level = await levelService.update(id, organizationId, data);
    return { level };
  }
);

export const deleteLevel = api(
  { expose: true, method: "DELETE", path: "/levels/:id", auth: true },
  async ({ id }: { id: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    await levelService.delete(id, organizationId);
  }
);
