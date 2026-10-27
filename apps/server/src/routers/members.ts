import { MembershipRole } from "@instride/shared";
import { ORPCError } from "@orpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { members } from "@/db/schema/organizations";
import { ensureProfiles } from "@/lib/profiles";
import { orgProcedure, requireRoles } from "@/orpc";

const roleSchema = z.enum(MembershipRole);

/** The signed-in user's membership in the current organization. */
const me = orgProcedure.handler(async ({ context }) => {
  return await db.query.members.findFirst({
    where: { id: context.member.id },
    with: { user: true, trainer: true, rider: true },
  });
});

/** All active members of the current organization. */
const list = requireRoles(MembershipRole.ADMIN, MembershipRole.TRAINER).handler(
  async ({ context }) => {
    return await db.query.members.findMany({
      where: {
        organizationId: context.organization.id,
        deletedAt: { isNull: true },
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        trainer: true,
        rider: true,
      },
    });
  }
);

/** Replace a member's roles. Creates trainer/rider profiles as needed. */
const setRoles = requireRoles(MembershipRole.ADMIN)
  .input(z.object({ memberId: z.uuid(), roles: z.array(roleSchema).min(1) }))
  .handler(async ({ input, context }) => {
    return await db.transaction(async (tx) => {
      const [member] = await tx
        .update(members)
        .set({ roles: input.roles })
        .where(
          and(
            eq(members.id, input.memberId),
            eq(members.organizationId, context.organization.id),
            isNull(members.deletedAt)
          )
        )
        .returning();
      if (!member) {
        throw new ORPCError("NOT_FOUND", { message: "Member not found" });
      }
      await ensureProfiles(tx, member);
      return member;
    });
  });

/** Soft-remove a member from the current organization. */
const remove = requireRoles(MembershipRole.ADMIN)
  .input(z.object({ memberId: z.uuid() }))
  .handler(async ({ input, context }) => {
    if (input.memberId === context.member.id) {
      throw new ORPCError("BAD_REQUEST", {
        message: "You can't remove yourself",
      });
    }
    await db
      .update(members)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(members.id, input.memberId),
          eq(members.organizationId, context.organization.id)
        )
      );
    return { ok: true as const };
  });

export const membersRouter = { me, list, setRoles, remove };
