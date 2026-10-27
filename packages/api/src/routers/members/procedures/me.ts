import { parseGuardianPermissions } from "@instride/db/guardian-permissions";
import { ORPCError } from "@orpc/server";

import { organizationProcedure } from "../../../procedures";
import { displayName, publicUserColumns } from "../../_shared/members";

/**
 * The signed-in user's membership in the current organization, plus who they
 * look after and who looks after them. `restrictions` is non-null when the
 * caller is a dependent: those are the rules their guardians set.
 */
export const me = organizationProcedure.handler(async ({ context }) => {
  const member = await context.db.query.members.findFirst({
    where: { id: context.member.id },
    with: {
      user: true,
      trainer: true,
      rider: true,
      controls: true,
      dependentLinks: {
        with: {
          dependent: {
            with: { user: { columns: publicUserColumns }, rider: true },
          },
        },
      },
      guardianLinks: {
        with: { guardian: { with: { user: { columns: publicUserColumns } } } },
      },
    },
  });
  if (!member) {
    throw new ORPCError("NOT_FOUND", { message: "Member not found" });
  }

  const { dependentLinks, guardianLinks, controls, ...rest } = member;
  const isDependent = guardianLinks.length > 0;

  return {
    ...rest,
    displayName: displayName(member),
    isGuardian: dependentLinks.length > 0,
    isDependent,
    restrictions: isDependent
      ? parseGuardianPermissions(controls?.permissions)
      : null,
    dependents: dependentLinks
      .filter((link) => link.dependent.deletedAt === null)
      .map((link) => ({
        relationshipId: link.id,
        memberId: link.dependent.id,
        name: displayName(link.dependent),
        hasLogin: link.dependent.userId !== null,
        rider: link.dependent.rider,
      })),
    guardians: guardianLinks.map((link) => ({
      relationshipId: link.id,
      memberId: link.guardian.id,
      name: displayName(link.guardian),
      user: link.guardian.user,
    })),
  };
});
