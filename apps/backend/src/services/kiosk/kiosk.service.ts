import { KioskScope } from "@instride/shared";
import { and, eq } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import {
  kioskSessions,
  type KioskSessionRow,
  type NewKioskSessionRow,
} from "./schema";

export const createKioskService = (client: Database | Transaction = db) => ({
  create: async (data: NewKioskSessionRow) => {
    const [session] = await client
      .insert(kioskSessions)
      .values(data)
      .returning();
    assertExists(session, "Failed to create kiosk session");
    return session;
  },

  findOne: async (id: string, organizationId: string) => {
    const session = await client.query.kioskSessions.findFirst({
      where: { id, organizationId },
      with: { board: true },
    });
    assertExists(session, "Kiosk session not found");
    return session;
  },

  findOneScalar: async (id: string, organizationId: string) => {
    const session = await client.query.kioskSessions.findFirst({
      where: { id, organizationId },
    });
    assertExists(session, "Kiosk session not found");
    return session;
  },

  findMany: async (organizationId: string) => {
    return await client.query.kioskSessions.findMany({
      where: { organizationId },
      with: { board: true },
      orderBy: { createdAt: "desc" },
    });
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<KioskSessionRow>
  ) => {
    const [session] = await client
      .update(kioskSessions)
      .set(data)
      .where(
        and(
          eq(kioskSessions.id, id),
          eq(kioskSessions.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(session, "Kiosk session not found");
    return session;
  },

  /** Clear acting identity. Used by both the API endpoint and the auto-expiry path. */
  clearActing: async (id: string, organizationId: string) => {
    await client
      .update(kioskSessions)
      .set({
        actingMemberId: null,
        scope: KioskScope.DEFAULT,
        expiresAt: null,
      })
      .where(
        and(
          eq(kioskSessions.id, id),
          eq(kioskSessions.organizationId, organizationId)
        )
      );
  },

  /** Set acting identity with an expiry. Used by `verifyKioskIdentity`. */
  setActing: async (params: {
    id: string;
    organizationId: string;
    actingMemberId: string;
    scope: KioskScope;
    expiresAt: Date;
  }) => {
    const [session] = await client
      .update(kioskSessions)
      .set({
        actingMemberId: params.actingMemberId,
        scope: params.scope,
        expiresAt: params.expiresAt,
      })
      .where(
        and(
          eq(kioskSessions.id, params.id),
          eq(kioskSessions.organizationId, params.organizationId)
        )
      )
      .returning();
    assertExists(session, "Kiosk session not found");
    return session;
  },

  delete: async (id: string, organizationId: string) => {
    await client
      .delete(kioskSessions)
      .where(
        and(
          eq(kioskSessions.id, id),
          eq(kioskSessions.organizationId, organizationId)
        )
      );
  },
});

export const kioskService = createKioskService();
