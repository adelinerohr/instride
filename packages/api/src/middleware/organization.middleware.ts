import { members, organizations } from "@instride/db/schema/organizations";
import { ORPCError, os } from "@orpc/server";
import { and, eq, isNull } from "drizzle-orm";

import { ORGANIZATION_HEADER } from "../constants";
import type { Context } from "../context";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Requires that the signed-in user is an active member of the organization in
 * the X-Organization-Id header. Adds `organization` and `member` to context.
 * Must run after requireAuth.
 */
export const requireOrganization = os
  .$context<Context & { user: { id: string } }>()
  .middleware(async ({ context, next }) => {
    const organizationId = context.headers.get(ORGANIZATION_HEADER);
    if (!(organizationId && UUID_PATTERN.test(organizationId))) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Missing or invalid X-Organization-Id header",
      });
    }

    const [row] = await context.db
      .select({ member: members, organization: organizations })
      .from(members)
      .innerJoin(organizations, eq(organizations.id, members.organizationId))
      .where(
        and(
          eq(members.organizationId, organizationId),
          eq(members.userId, context.user.id),
          isNull(members.deletedAt)
        )
      )
      .limit(1);

    if (!row) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not a member of this organization",
      });
    }

    return await next({
      context: { organization: row.organization, member: row.member },
    });
  });
