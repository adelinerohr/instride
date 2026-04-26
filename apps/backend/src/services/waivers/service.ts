import { WaiverStatus } from "@instride/shared";
import { and, eq } from "drizzle-orm";

import { NewWaiverSignatureRow, waiverSignatures } from "@/database/schema";
import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { NewWaiverRow, WaiverRow, waivers } from "./schema/waivers";

export const createWaiverService = (client: Database | Transaction = db) => ({
  create: async (data: NewWaiverRow) => {
    const [waiver] = await client.insert(waivers).values(data).returning();
    assertExists(waiver, "Failed to create waiver");
    return waiver;
  },

  createSignature: async (data: NewWaiverSignatureRow) => {
    const [signature] = await client
      .insert(waiverSignatures)
      .values(data)
      .returning();
    assertExists(signature, "Failed to create signature");
    return signature;
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<WaiverRow>
  ) => {
    const [waiver] = await client
      .update(waivers)
      .set(data)
      .where(
        and(eq(waivers.id, id), eq(waivers.organizationId, organizationId))
      )
      .returning();
    assertExists(waiver, "Waiver not found");
    return waiver;
  },

  findOne: async (id: string, organizationId: string) => {
    const waiver = await client.query.waivers.findFirst({
      where: { id, organizationId },
    });
    assertExists(waiver, "Waiver not found");
    return waiver;
  },

  findMany: async (organizationId: string) => {
    const waivers = await client.query.waivers.findMany({
      where: { organizationId },
    });
    return waivers;
  },

  findOneSignature: async (params: {
    id?: string;
    organizationId: string;
    waiverId: string;
    signerMemberId?: string;
    onBehalfOfMemberId?: string;
  }) => {
    const { id, organizationId, waiverId, signerMemberId, onBehalfOfMemberId } =
      params;
    const signature = await client.query.waiverSignatures.findFirst({
      where: {
        waiverId,
        organizationId,
        ...(id && { id }),
        ...(signerMemberId && { signerMemberId }),
        ...(onBehalfOfMemberId && { onBehalfOfMemberId }),
      },
    });
    assertExists(signature, "Signature not found");
    return signature;
  },

  findManySignatures: async (
    waiverId: string,
    organizationId: string,
    signerMemberId?: string
  ) => {
    const signatures = await client.query.waiverSignatures.findMany({
      where: {
        waiverId,
        organizationId,
        ...(signerMemberId && { signerMemberId }),
      },
    });
    return signatures;
  },

  archive: async (id: string, organizationId: string) => {
    const [waiver] = await client
      .update(waivers)
      .set({ status: WaiverStatus.ARCHIVED })
      .where(
        and(eq(waivers.id, id), eq(waivers.organizationId, organizationId))
      )
      .returning();
    assertExists(waiver, "Failed to archive waiver");
    return waiver;
  },
});

export const waiverService = createWaiverService();
