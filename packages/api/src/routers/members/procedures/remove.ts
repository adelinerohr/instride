import { MembershipRole } from "@instride/db/enums";
import { members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import { roleProcedure } from "../../../procedures";
import { RemoveMemberSchema } from "../schemas";

/** Soft-remove a member from the current organization. */
export const remove = roleProcedure(MembershipRole.ADMIN)
  .input(RemoveMemberSchema)
  .handler(async ({ input, context }) => {
    if (input.memberId === context.member.id) {
      throw new ORPCError("BAD_REQUEST", {
        message: "You can't remove yourself",
      });
    }
    await context.db
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
