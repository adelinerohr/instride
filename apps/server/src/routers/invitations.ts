import { randomBytes } from "node:crypto";

import { MembershipRole } from "@instride/shared";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { invitations, members } from "@/db/schema/organizations";
import { ensureProfiles, mergeRoles } from "@/lib/profiles";
import { authedProcedure, publicProcedure, requireRoles } from "@/orpc";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const TOKEN_BYTES = 24;

const roleSchema = z.enum(MembershipRole);

/**
 * Invite someone by email. Returns the token for the invite link.
 * TODO: send the email (React Email + your provider) once the link route exists.
 */
const create = requireRoles(MembershipRole.ADMIN)
  .input(
    z.object({
      email: z.email().transform((value) => value.trim().toLowerCase()),
      roles: z.array(roleSchema).min(1),
    })
  )
  .handler(async ({ input, context }) => {
    const [invitation] = await db
      .insert(invitations)
      .values({
        organizationId: context.organization.id,
        email: input.email,
        roles: input.roles,
        token: randomBytes(TOKEN_BYTES).toString("base64url"),
        invitedByUserId: context.user.id,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      })
      .returning();
    return invitation;
  });

const list = requireRoles(MembershipRole.ADMIN).handler(async ({ context }) => {
  return await db.query.invitations.findMany({
    where: { organizationId: context.organization.id, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
});

const revoke = requireRoles(MembershipRole.ADMIN)
  .input(z.object({ invitationId: z.uuid() }))
  .handler(async ({ input, context }) => {
    await db
      .update(invitations)
      .set({ status: "revoked" })
      .where(
        and(
          eq(invitations.id, input.invitationId),
          eq(invitations.organizationId, context.organization.id)
        )
      );
    return { ok: true as const };
  });

/** Public: lets the invite page show "Join Redcoat Farm" before sign-in. */
const byToken = publicProcedure
  .input(z.object({ token: z.string().min(1) }))
  .handler(async ({ input }) => {
    const invitation = await db.query.invitations.findFirst({
      where: { token: input.token },
      columns: { email: true, roles: true, status: true, expiresAt: true },
      with: {
        organization: {
          columns: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
    });
    if (!invitation) {
      throw new ORPCError("NOT_FOUND", { message: "Invitation not found" });
    }
    return invitation;
  });

/** Signed-in user accepts an invitation sent to their email. */
const accept = authedProcedure
  .input(z.object({ token: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const invitation = await db.query.invitations.findFirst({
      where: { token: input.token },
    });

    if (!invitation || invitation.status !== "pending") {
      throw new ORPCError("NOT_FOUND", {
        message: "This invitation is no longer valid",
      });
    }
    if (invitation.expiresAt < new Date()) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This invitation has expired",
      });
    }
    if (invitation.email !== context.user.email.toLowerCase()) {
      throw new ORPCError("FORBIDDEN", {
        message: `This invitation was sent to ${invitation.email}`,
      });
    }

    return await db.transaction(async (tx) => {
      const existing = await tx.query.members.findFirst({
        where: {
          organizationId: invitation.organizationId,
          userId: context.user.id,
        },
      });

      const [member] = existing
        ? await tx
            .update(members)
            .set({
              roles: mergeRoles(
                existing.deletedAt ? [] : existing.roles,
                invitation.roles
              ),
              deletedAt: null,
            })
            .where(eq(members.id, existing.id))
            .returning()
        : await tx
            .insert(members)
            .values({
              organizationId: invitation.organizationId,
              userId: context.user.id,
              roles: invitation.roles,
            })
            .returning();

      if (!member) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }

      await ensureProfiles(tx, member);
      await tx
        .update(invitations)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(invitations.id, invitation.id));

      return member;
    });
  });

export const invitationsRouter = { create, list, revoke, byToken, accept };
