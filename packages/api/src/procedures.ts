import type { MembershipRole } from "@instride/db/enums";
import { ORPCError } from "@orpc/server";

import { requireAuth } from "./middleware/auth.middleware";
import { requireOrganization } from "./middleware/organization.middleware";
import { o } from "./orpc";

/** Anyone, signed in or not. */
export const publicProcedure = o;

/** Signed-in user. Context gains `user`. */
export const protectedProcedure = publicProcedure.use(requireAuth);

/** Signed-in member of the X-Organization-Id org. Context gains `organization` and `member`. */
export const organizationProcedure =
  protectedProcedure.use(requireOrganization);

/** Organization procedure that also requires at least one of the given roles. */
export function roleProcedure(...allowed: MembershipRole[]) {
  return organizationProcedure.use(async ({ context, next }) => {
    const permitted = context.member.roles.some((role) =>
      allowed.includes(role)
    );
    if (!permitted) {
      throw new ORPCError("FORBIDDEN", {
        message: `Requires role: ${allowed.join(" or ")}`,
      });
    }
    return await next();
  });
}
