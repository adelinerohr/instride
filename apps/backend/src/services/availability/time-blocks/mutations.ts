import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { timeBlocks } from "../schema";
import { TimeBlock } from "../types/models";

interface CreateTimeBlockParams {
  trainerId: string;
  start: string;
  end: string;
  boardId?: string | null;
  reason?: string | null;
}

export const createTimeBlock = api(
  {
    method: "POST",
    path: "/time-blocks",
    expose: true,
    auth: true,
  },
  async (params: CreateTimeBlockParams): Promise<TimeBlock> => {
    const { organizationId } = requireOrganizationAuth();

    const [timeBlock] = await db
      .insert(timeBlocks)
      .values({
        ...params,
        organizationId,
        start: new Date(params.start),
        end: new Date(params.end),
      })
      .returning();

    return timeBlock;
  }
);

interface UpdateTimeBlockParams extends CreateTimeBlockParams {
  id: string;
}

export const updateTimeBlock = api(
  {
    method: "PUT",
    path: "/time-blocks/:id",
    expose: true,
    auth: true,
  },
  async (params: UpdateTimeBlockParams): Promise<TimeBlock> => {
    const { id, ...rest } = params;
    const [timeBlock] = await db
      .update(timeBlocks)
      .set({
        ...rest,
        start: new Date(rest.start),
        end: new Date(rest.end),
      })
      .where(eq(timeBlocks.id, id))
      .returning();
    return timeBlock;
  }
);

export const deleteTimeBlock = api(
  {
    method: "DELETE",
    path: "/time-blocks/:id",
    expose: true,
    auth: true,
  },
  async (params: { id: string }): Promise<void> => {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, params.id));
  }
);
