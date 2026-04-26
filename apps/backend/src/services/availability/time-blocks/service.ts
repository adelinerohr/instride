import { and, eq } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { NewTimeBlockRow, TimeBlockRow, timeBlocks } from "../schema";

export const createTimeBlockService = (
  client: Database | Transaction = db
) => ({
  create: async (data: NewTimeBlockRow) => {
    const [timeBlock] = await client
      .insert(timeBlocks)
      .values(data)
      .returning();
    assertExists(timeBlock, "Failed to create time block");
    return timeBlock;
  },

  findOne: async (id: string, organizationId: string) => {
    const timeBlock = await client.query.timeBlocks.findFirst({
      where: { id, organizationId },
    });
    assertExists(timeBlock, "Time block not found");
    return timeBlock;
  },

  findMany: async (
    organizationId: string,
    filters?: { trainerId?: string; from?: Date; to?: Date }
  ) => {
    return await client.query.timeBlocks.findMany({
      where: {
        organizationId,
        ...(filters?.trainerId && { trainerId: filters.trainerId }),
        ...(filters?.from && { start: { gte: filters.from } }),
        ...(filters?.to && { end: { lte: filters.to } }),
      },
      orderBy: { start: "asc" },
    });
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<TimeBlockRow>
  ) => {
    const [timeBlock] = await client
      .update(timeBlocks)
      .set(data)
      .where(
        and(
          eq(timeBlocks.id, id),
          eq(timeBlocks.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(timeBlock, "Failed to update time block");
    return timeBlock;
  },

  delete: async (id: string, organizationId: string) => {
    await client
      .delete(timeBlocks)
      .where(
        and(
          eq(timeBlocks.id, id),
          eq(timeBlocks.organizationId, organizationId)
        )
      );
  },
});

export const timeBlockService = createTimeBlockService();
