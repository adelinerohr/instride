import { InvitationStatus, MembershipRole } from "@instride/shared";
import { generateId } from "better-auth";
import { eq } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import {
  authInvitations,
  type AuthInvitationRow,
  type NewAuthInvitationRow,
} from "../schema";

const INVITATION_EXPIRY_DAYS = 7;

export const createInvitationService = (
  client: Database | Transaction = db
) => ({
  create: async (
    data: Omit<NewAuthInvitationRow, "id" | "expiresAt"> & {
      expiresAt?: Date;
    }
  ) => {
    const expiresAt =
      data.expiresAt ??
      new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const [invitation] = await client
      .insert(authInvitations)
      .values({ ...data, id: generateId(), expiresAt })
      .returning();
    assertExists(invitation, "Failed to create invitation");
    return invitation;
  },

  findOne: async (id: string) => {
    const invitation = await client.query.authInvitations.findFirst({
      where: { id },
    });
    assertExists(invitation, "Invitation not found");
    return invitation;
  },

  findOneSafe: async (id: string) => {
    return await client.query.authInvitations.findFirst({ where: { id } });
  },

  findPendingForOrgEmail: async (params: {
    organizationId: string;
    email: string;
  }) => {
    return await client.query.authInvitations.findFirst({
      where: {
        organizationId: params.organizationId,
        email: params.email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
    });
  },

  findAcceptedForOrgEmail: async (params: {
    organizationId: string;
    email: string;
  }) => {
    return await client.query.authInvitations.findFirst({
      where: {
        organizationId: params.organizationId,
        email: params.email.toLowerCase(),
        status: InvitationStatus.ACCEPTED,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findManyByOrg: async (organizationId: string) => {
    return await client.query.authInvitations.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  },

  findManyByEmail: async (email: string) => {
    return await client.query.authInvitations.findMany({
      where: {
        email: email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus: async (
    id: string,
    status: InvitationStatus
  ): Promise<AuthInvitationRow> => {
    const [updated] = await client
      .update(authInvitations)
      .set({ status })
      .where(eq(authInvitations.id, id))
      .returning();
    assertExists(updated, "Invitation not found");
    return updated;
  },

  upsertPending: async (data: {
    organizationId: string;
    email: string;
    roles: MembershipRole[];
    inviterId: string;
    expiresAt?: Date;
  }) => {
    // The partial unique index `(org, email) WHERE status = 'pending'`
    // means we either UPDATE an existing pending row or INSERT a new one.
    // We can't use ON CONFLICT directly with a partial unique index across
    // dialects, so do this in two steps.
    const existing = await client.query.authInvitations.findFirst({
      where: {
        organizationId: data.organizationId,
        email: data.email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
    });

    const expiresAt =
      data.expiresAt ??
      new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    if (existing) {
      const [updated] = await client
        .update(authInvitations)
        .set({
          roles: data.roles,
          inviterId: data.inviterId,
          expiresAt,
        })
        .where(eq(authInvitations.id, existing.id))
        .returning();
      assertExists(updated, "Invitation not found");
      return updated;
    }

    const [created] = await client
      .insert(authInvitations)
      .values({
        id: generateId(),
        organizationId: data.organizationId,
        email: data.email.toLowerCase(),
        roles: data.roles,
        inviterId: data.inviterId,
        expiresAt,
        status: InvitationStatus.PENDING,
      })
      .returning();
    assertExists(created, "Failed to create invitation");
    return created;
  },
});

export const invitationService = createInvitationService();
