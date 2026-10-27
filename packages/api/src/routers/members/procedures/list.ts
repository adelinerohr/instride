import { MembershipRole } from "@instride/db/enums";

import { roleProcedure } from "../../../procedures";
import { displayName, publicUserColumns } from "../../_shared/members";

/** All active members of the current organization, including dependents without a login. */
export const list = roleProcedure(
  MembershipRole.ADMIN,
  MembershipRole.TRAINER
).handler(async ({ context }) => {
  const rows = await context.db.query.members.findMany({
    where: {
      organizationId: context.organization.id,
      deletedAt: { isNull: true },
    },
    with: {
      user: { columns: publicUserColumns },
      trainer: true,
      rider: true,
      guardianLinks: { columns: { guardianMemberId: true } },
    },
  });

  return rows.map(({ guardianLinks, ...member }) => ({
    ...member,
    displayName: displayName(member),
    hasLogin: member.userId !== null,
    isDependent: guardianLinks.length > 0,
    guardianMemberIds: guardianLinks.map((link) => link.guardianMemberId),
  }));
});
