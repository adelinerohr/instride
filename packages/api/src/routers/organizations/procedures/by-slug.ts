import { ORPCError } from "@orpc/server";

import { publicProcedure } from "../../../procedures";
import { OrganizationBySlugSchema } from "../schemas";

/** Public: resolves a barn's subdomain or join page. */
export const bySlug = publicProcedure
  .input(OrganizationBySlugSchema)
  .handler(async ({ input, context }) => {
    const organization = await context.db.query.organizations.findFirst({
      where: { slug: input.slug },
    });
    if (!organization) {
      throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
    }
    return organization;
  });
