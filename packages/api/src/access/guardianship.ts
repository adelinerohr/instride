import type { Database, Transaction } from "@instride/db";
import { MembershipRole } from "@instride/db/enums";
import { parseGuardianPermissions } from "@instride/db/guardian-permissions";
import {
  dependentControls,
  guardianRelationships,
} from "@instride/db/schema/guardianship";
import { members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { and, count, eq, isNull } from "drizzle-orm";

type Db = Database | Transaction;

interface OrgMember {
  id: string;
  organizationId: string;
  roles: MembershipRole[];
}

export function isAdmin(member: Pick<OrgMember, "roles">): boolean {
  return member.roles.includes(MembershipRole.ADMIN);
}

export function isStaff(member: Pick<OrgMember, "roles">): boolean {
  return (
    member.roles.includes(MembershipRole.ADMIN) ||
    member.roles.includes(MembershipRole.TRAINER)
  );
}

/** Active member of this org, or NOT_FOUND. Never trust ids from input without this. */
export async function findMemberInOrg(
  db: Db,
  organizationId: string,
  memberId: string
) {
  const member = await db.query.members.findFirst({
    where: { id: memberId, organizationId, deletedAt: { isNull: true } },
  });
  if (!member) {
    throw new ORPCError("NOT_FOUND", { message: "Member not found" });
  }
  return member;
}

export async function findActiveLink(
  db: Db,
  guardianMemberId: string,
  dependentMemberId: string
) {
  return await db.query.guardianRelationships.findFirst({
    where: { guardianMemberId, dependentMemberId, revokedAt: { isNull: true } },
  });
}

export async function countActiveGuardians(
  db: Db,
  dependentMemberId: string
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(guardianRelationships)
    .where(
      and(
        eq(guardianRelationships.dependentMemberId, dependentMemberId),
        isNull(guardianRelationships.revokedAt)
      )
    );
  return row?.value ?? 0;
}

/**
 * The caller may manage this dependent if they are one of their active
 * guardians, or an admin of the organization. Returns the dependent member
 * and how access was granted.
 */
export async function assertCanManageDependent(
  db: Db,
  caller: OrgMember,
  dependentMemberId: string
): Promise<{
  dependent: typeof members.$inferSelect;
  via: "guardian" | "admin";
}> {
  const dependent = await findMemberInOrg(
    db,
    caller.organizationId,
    dependentMemberId
  );

  const link = await findActiveLink(db, caller.id, dependent.id);
  if (link) {
    return { dependent, via: "guardian" };
  }
  if (isAdmin(caller)) {
    return { dependent, via: "admin" };
  }
  throw new ORPCError("FORBIDDEN", {
    message: "You are not a guardian of this member",
  });
}

/**
 * Link a guardian to a dependent and make sure the dependent has a controls
 * row. Idempotent: an existing active link is returned as-is.
 */
export async function linkGuardian(
  tx: Transaction,
  input: {
    organizationId: string;
    guardianMemberId: string;
    dependentMemberId: string;
    consentGivenByMemberId?: string;
  }
) {
  if (input.guardianMemberId === input.dependentMemberId) {
    throw new ORPCError("BAD_REQUEST", {
      message: "A member can't be their own guardian",
    });
  }

  const existing = await findActiveLink(
    tx,
    input.guardianMemberId,
    input.dependentMemberId
  );
  const link =
    existing ??
    (
      await tx
        .insert(guardianRelationships)
        .values({
          organizationId: input.organizationId,
          guardianMemberId: input.guardianMemberId,
          dependentMemberId: input.dependentMemberId,
        })
        .returning()
    )[0];

  await tx
    .insert(dependentControls)
    .values({
      memberId: input.dependentMemberId,
      organizationId: input.organizationId,
      ...(input.consentGivenByMemberId && {
        consentGivenAt: new Date(),
        consentGivenByMemberId: input.consentGivenByMemberId,
      }),
    })
    .onConflictDoNothing();

  if (!link) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }
  return link;
}

/** Effective permissions for a dependent, with defaults filled in. */
export async function getDependentPermissions(
  db: Db,
  dependentMemberId: string
) {
  const controls = await db.query.dependentControls.findFirst({
    where: { memberId: dependentMemberId },
  });
  return parseGuardianPermissions(controls?.permissions);
}

/**
 * Login-less dependents who would be left with no guardian if `guardianMemberId`
 * stopped being their guardian. Used to block revoking or removing the last one.
 */
export async function findOrphanedDependents(db: Db, guardianMemberId: string) {
  const links = await db.query.guardianRelationships.findMany({
    where: { guardianMemberId, revokedAt: { isNull: true } },
    with: { dependent: { columns: { id: true, userId: true, name: true } } },
  });

  const orphaned: { id: string; name: string | null }[] = [];
  for (const link of links) {
    const hasLogin = link.dependent.userId !== null;
    if (
      !hasLogin &&
      (await countActiveGuardians(db, link.dependentMemberId)) <= 1
    ) {
      orphaned.push({ id: link.dependent.id, name: link.dependent.name });
    }
  }
  return orphaned;
}
