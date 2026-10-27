import { MembershipRole } from "@instride/db/enums";
import { guardianRelationships } from "@instride/db/schema/guardianship";
import { members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { and, eq, isNull, or } from "drizzle-orm";

import {
  findMemberInOrg,
  findOrphanedDependents,
} from "../../../access/guardianship";
import { roleProcedure } from "../../../procedures";
import { RemoveMemberSchema } from "../schemas";

/**
 * Soft-remove a member and end all of their guardian links (both directions).
 * Refuses if it would leave a dependent without a login with no guardian:
 * remove or reassign those dependents first.
 */
export const remove = roleProcedure(MembershipRole.ADMIN)
  .input(RemoveMemberSchema)
  .handler(async ({ input, context }) => {
    if (input.memberId === context.member.id) {
      throw new ORPCError("BAD_REQUEST", {
        message: "You can't remove yourself",
      });
    }

    const target = await findMemberInOrg(
      context.db,
      context.organization.id,
      input.memberId
    );

    const orphaned = await findOrphanedDependents(context.db, target.id);
    if (orphaned.length > 0) {
      const names = orphaned
        .map((dependent) => dependent.name ?? "a dependent")
        .join(", ");
      throw new ORPCError("BAD_REQUEST", {
        message: `This member is the only guardian of ${names}. Add another guardian or remove those dependents first.`,
        data: {
          orphanedDependentIds: orphaned.map((dependent) => dependent.id),
        },
      });
    }

    await context.db.transaction(async (tx) => {
      const now = new Date();
      await tx
        .update(members)
        .set({ deletedAt: now })
        .where(eq(members.id, target.id));
      await tx
        .update(guardianRelationships)
        .set({ revokedAt: now, revokedByMemberId: context.member.id })
        .where(
          and(
            isNull(guardianRelationships.revokedAt),
            or(
              eq(guardianRelationships.guardianMemberId, target.id),
              eq(guardianRelationships.dependentMemberId, target.id)
            )
          )
        );
    });

    return { ok: true as const };
  });
