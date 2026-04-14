import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { timeBlocks } from "../schema";
import { GetTimeBlockResponse } from "../types/contracts";

interface CreateTimeBlockRequest {
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
  async (request: CreateTimeBlockRequest): Promise<GetTimeBlockResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const [timeBlock] = await db
      .insert(timeBlocks)
      .values({
        ...request,
        organizationId,
        start: new Date(request.start),
        end: new Date(request.end),
      })
      .returning();

    return { timeBlock };
  }
);

interface UpdateTimeBlockRequest extends CreateTimeBlockRequest {
  id: string;
}

export const updateTimeBlock = api(
  {
    method: "PUT",
    path: "/time-blocks/:id",
    expose: true,
    auth: true,
  },
  async (request: UpdateTimeBlockRequest): Promise<GetTimeBlockResponse> => {
    const { id, ...rest } = request;
    const [timeBlock] = await db
      .update(timeBlocks)
      .set({
        ...rest,
        start: new Date(rest.start),
        end: new Date(rest.end),
      })
      .where(eq(timeBlocks.id, id))
      .returning();
    return { timeBlock };
  }
);

export const deleteTimeBlock = api(
  {
    method: "DELETE",
    path: "/time-blocks/:id",
    expose: true,
    auth: true,
  },
  async ({ id }: { id: string }): Promise<void> => {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
  }
);
