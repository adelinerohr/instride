import { and, eq } from "drizzle-orm";

import { Database } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { LevelRow, levels, NewLevelRow } from "../schema";

export const createLevelService = (client: Database = db) => ({
  create: async (data: NewLevelRow) => {
    const [created] = await client.insert(levels).values(data).returning();
    assertExists(created, "Level not created");
    return created;
  },

  findOne: async (id: string, organizationId: string) => {
    const level = await client.query.levels.findFirst({
      where: { id, organizationId },
    });
    assertExists(level, "Level not found");
    return level;
  },

  findMany: async (organizationId: string) => {
    const levels = await client.query.levels.findMany({
      where: { organizationId },
    });
    return levels;
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<LevelRow>
  ) => {
    const [updated] = await client
      .update(levels)
      .set(data)
      .where(and(eq(levels.id, id), eq(levels.organizationId, organizationId)))
      .returning();
    assertExists(updated, "Level not updated");
    return updated;
  },

  delete: async (id: string, organizationId: string) => {
    await client
      .delete(levels)
      .where(and(eq(levels.id, id), eq(levels.organizationId, organizationId)));
  },
});

export const levelService = createLevelService();
