import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { levels } from "../schema";
import { GetLevelResponse } from "../types/contracts";

interface CreateLevelRequest {
  name: string;
  color: string;
  description?: string | null;
}

export const createLevel = api(
  {
    expose: true,
    method: "POST",
    path: "/levels",
    auth: true,
  },
  async (request: CreateLevelRequest): Promise<GetLevelResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const [level] = await db
      .insert(levels)
      .values({
        organizationId,
        ...request,
      })
      .returning();
    return { level };
  }
);

interface UpdateLevelRequest extends Partial<CreateLevelRequest> {
  id: string;
}

export const updateLevel = api(
  {
    expose: true,
    method: "PUT",
    path: "/levels/:id",
    auth: true,
  },
  async (request: UpdateLevelRequest): Promise<GetLevelResponse> => {
    const { id } = request;
    const [level] = await db
      .update(levels)
      .set(request)
      .where(eq(levels.id, id))
      .returning();
    return { level };
  }
);

export const deleteLevel = api(
  {
    expose: true,
    method: "DELETE",
    path: "/levels/:id",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<void> => {
    await db.delete(levels).where(eq(levels.id, id));
  }
);
