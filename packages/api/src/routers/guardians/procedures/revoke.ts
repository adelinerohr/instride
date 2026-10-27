import { guardianRelationships } from "@instride/db/schema/guardianship";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";

import { countActiveGuardians, isAdmin } from "../../../access/guardianship";
import { organizationProcedure } from "../../../procedures";
import { RevokeGuardianSchema } from "../schemas";

/**
 * End a guardian link. Allowed for the guardian on that link, the dependent
 * themselves (once they have their own login), or an admin.
 *
 * A dependent without a login must always have at least one guardian, so the
 * last link can't be revoked; remove the dependent instead.
 */
export const revoke = organizationProcedure
  .input(RevokeGuardianSchema)
  .handler(async ({ input, context }) => {
    const link = await context.db.query.guardianRelationships.findFirst({
      where: {
        id: input.relationshipId,
        organizationId: context.organization.id,
        revokedAt: { isNull: true },
      },
      with: { dependent: { columns: { id: true, userId: true } } },
    });
    if (!link) {
      throw new ORPCError("NOT_FOUND", { message: "Guardian link not found" });
    }

    const isGuardian = link.guardianMemberId === context.member.id;
    const isDependentWithLogin =
      link.dependentMemberId === context.member.id &&
      link.dependent.userId !== null;
    if (!(isGuardian || isDependentWithLogin || isAdmin(context.member))) {
      throw new ORPCError("FORBIDDEN", {
        message: "You can't remove this guardian",
      });
    }

    const hasLogin = link.dependent.userId !== null;
    if (
      !hasLogin &&
      (await countActiveGuardians(context.db, link.dependentMemberId)) <= 1
    ) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "This dependent needs at least one guardian. Add another guardian first, or remove the dependent.",
      });
    }

    await context.db
      .update(guardianRelationships)
      .set({ revokedAt: new Date(), revokedByMemberId: context.member.id })
      .where(eq(guardianRelationships.id, link.id));

    return { ok: true as const };
  });
