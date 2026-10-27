import type { Transaction } from "@instride/db";
import { MembershipRole } from "@instride/db/enums";
import { riders, trainers } from "@instride/db/schema/profiles";

/**
 * Make sure a member has the profile rows their roles need (a trainers row if
 * they are a trainer, a riders row if they are a rider). Safe to call again
 * after roles change; it never deletes anything.
 */
export async function ensureProfiles(
  tx: Transaction,
  member: { id: string; organizationId: string; roles: MembershipRole[] }
): Promise<void> {
  const values = { memberId: member.id, organizationId: member.organizationId };

  if (member.roles.includes(MembershipRole.TRAINER)) {
    await tx.insert(trainers).values(values).onConflictDoNothing();
  }
  if (member.roles.includes(MembershipRole.RIDER)) {
    await tx.insert(riders).values(values).onConflictDoNothing();
  }
}

export function mergeRoles(
  current: MembershipRole[],
  added: MembershipRole[]
): MembershipRole[] {
  return [...new Set([...current, ...added])];
}
