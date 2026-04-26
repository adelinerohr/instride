import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { activityExpansion } from "./fragments";
import { activity, type NewActivityRow } from "./schema";

export const createActivityService = (client: Database | Transaction = db) => ({
  create: async (data: NewActivityRow) => {
    const [created] = await client.insert(activity).values(data).returning();
    assertExists(created, "Failed to create activity");
    return created;
  },

  createMany: async (rows: NewActivityRow[]) => {
    if (rows.length === 0) return [];
    return await client.insert(activity).values(rows).returning();
  },

  findRoleNeutral: async (params: {
    organizationId: string;
    ownerMemberId: string;
  }) => {
    return await client.query.activity.findMany({
      where: {
        organizationId: params.organizationId,
        ownerMemberId: params.ownerMemberId,
        trainerId: { isNull: true },
        riderId: { isNull: true },
      },
      orderBy: { createdAt: "desc" },
      with: activityExpansion,
    });
  },

  findForRider: async (params: { organizationId: string; riderId: string }) => {
    return await client.query.activity.findMany({
      where: {
        organizationId: params.organizationId,
        riderId: params.riderId,
      },
      orderBy: { createdAt: "desc" },
      with: activityExpansion,
    });
  },

  findForTrainer: async (params: {
    organizationId: string;
    trainerId: string;
  }) => {
    return await client.query.activity.findMany({
      where: {
        organizationId: params.organizationId,
        trainerId: params.trainerId,
      },
      orderBy: { createdAt: "desc" },
      with: activityExpansion,
    });
  },
});

export const activityService = createActivityService();
