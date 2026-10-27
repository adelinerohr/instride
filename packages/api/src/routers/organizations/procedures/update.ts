import { MembershipRole } from "@instride/db/enums";
import { organizations } from "@instride/db/schema/organizations";
import { eq } from "drizzle-orm";

import { roleProcedure } from "../../../procedures";
import { UpdateOrganizationSchema } from "../schemas";

/** Update the current organization (from the X-Organization-Id header). */
export const update = roleProcedure(MembershipRole.ADMIN)
  .input(UpdateOrganizationSchema)
  .handler(async ({ input, context }) => {
    const [organization] = await context.db
      .update(organizations)
      .set(input)
      .where(eq(organizations.id, context.organization.id))
      .returning();
    return organization;
  });
