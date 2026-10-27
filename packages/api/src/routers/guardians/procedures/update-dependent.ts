import { members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";

import { assertCanManageDependent } from "../../../access/guardianship";
import { organizationProcedure } from "../../../procedures";
import { UpdateDependentSchema } from "../schemas";

/**
 * Edit a login-less dependent's name or date of birth. Once a dependent has
 * their own login, their name lives on their account and they edit it there.
 */
export const updateDependent = organizationProcedure
  .input(UpdateDependentSchema)
  .handler(async ({ input, context }) => {
    const { dependent } = await assertCanManageDependent(
      context.db,
      context.member,
      input.dependentMemberId
    );

    if (dependent.userId !== null) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "This member has their own login and manages their own profile",
      });
    }

    const [updated] = await context.db
      .update(members)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.dateOfBirth !== undefined && {
          dateOfBirth: input.dateOfBirth,
        }),
      })
      .where(eq(members.id, dependent.id))
      .returning();
    return updated;
  });
