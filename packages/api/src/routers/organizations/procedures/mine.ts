import { members, organizations } from "@instride/db/schema/organizations";
import { and, eq, isNull } from "drizzle-orm";

import { protectedProcedure } from "../../../procedures";

/** Every organization the signed-in user belongs to, with their roles. */
export const mine = protectedProcedure.handler(async ({ context }) => {
  return await context.db
    .select({
      organization: organizations,
      memberId: members.id,
      roles: members.roles,
    })
    .from(members)
    .innerJoin(organizations, eq(organizations.id, members.organizationId))
    .where(and(eq(members.userId, context.user.id), isNull(members.deletedAt)))
    .orderBy(organizations.name);
});
