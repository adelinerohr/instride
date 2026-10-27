import { MembershipRole } from "@instride/db/enums";
import { members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { and, eq, isNull } from "drizzle-orm";

import { roleProcedure } from "../../../procedures";
import { ensureProfiles } from "../../_shared/profiles";
import { SetMemberRolesSchema } from "../schemas";

/** Replace a member's roles. Creates trainer/rider profiles as needed. */
export const setRoles = roleProcedure(MembershipRole.ADMIN)
  .input(SetMemberRolesSchema)
  .handler(async ({ input, context }) => {
    return await context.db.transaction(async (tx) => {
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
