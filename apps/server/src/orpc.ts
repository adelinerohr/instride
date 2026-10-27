import type { MembershipRole } from "@instride/shared";
import { ORPCError, os } from "@orpc/server";
import { and, eq, isNull } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { members, organizations } from "@/db/schema/organizations";

/** Same header the existing frontends already send. */
export const ORG_HEADER = "x-organization-id";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface BaseContext {
  headers: Headers;
}

const base = os.$context<BaseContext>();

/** Anyone, signed in or not. */
export const publicProcedure = base;

/** Requires a signed-in user. Adds `user` and `session` to context. */
export const authedProcedure = base.use(async ({ context, next }) => {
  const result = await auth.api.getSession({ headers: context.headers });
  if (!result) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({ context: { user: result.user, session: result.session } });
});

/**
 * Requires a signed-in user who is a member of the organization named in the
 * X-Organization-Id header. Adds `organization` and `member` to context.
 */
export const orgProcedure = authedProcedure.use(async ({ context, next }) => {
  const organizationId = context.headers.get(ORG_HEADER);
  if (!(organizationId && UUID_PATTERN.test(organizationId))) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Missing or invalid X-Organization-Id header",
    });
  }

  const [row] = await db
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

  return next({
    context: { organization: row.organization, member: row.member },
  });
});

/** Org procedure that also requires at least one of the given roles. */
export function requireRoles(...allowed: MembershipRole[]) {
  return orgProcedure.use(({ context, next }) => {
    const ok = context.member.roles.some((role) => allowed.includes(role));
    if (!ok) {
      throw new ORPCError("FORBIDDEN", {
        message: `Requires role: ${allowed.join(" or ")}`,
      });
    }
    return next();
  });
}
