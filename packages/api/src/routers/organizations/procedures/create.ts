import { MembershipRole } from "@instride/db/enums";
import { members, organizations } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";

import { protectedProcedure } from "../../../procedures";
import { CreateOrganizationSchema } from "../schemas";

/** Create an organization. The creator becomes its first admin. */
export const create = protectedProcedure
  .input(CreateOrganizationSchema)
  .handler(async ({ input, context }) => {
    const taken = await context.db.query.organizations.findFirst({
      where: { slug: input.slug },
      columns: { id: true },
    });
    if (taken) {
      throw new ORPCError("CONFLICT", { message: "That URL is already taken" });
    }

    return await context.db.transaction(async (tx) => {
      const [organization] = await tx
        .insert(organizations)
        .values(input)
        .returning();
      if (!organization) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }

      const [member] = await tx
        .insert(members)
        .values({
          organizationId: organization.id,
          userId: context.user.id,
          roles: [MembershipRole.ADMIN],
          onboardingComplete: true,
        })
        .returning();

      return { organization, member };
    });
  });
