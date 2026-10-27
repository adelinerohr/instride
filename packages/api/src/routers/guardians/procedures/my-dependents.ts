import { parseGuardianPermissions } from "@instride/db/guardian-permissions";

import { organizationProcedure } from "../../../procedures";
import { displayName, publicUserColumns } from "../../_shared/members";

/** Everyone the caller is an active guardian of, with their rider profile and permissions. */
export const myDependents = organizationProcedure.handler(
  async ({ context }) => {
    const links = await context.db.query.guardianRelationships.findMany({
      where: {
        guardianMemberId: context.member.id,
        revokedAt: { isNull: true },
      },
      orderBy: { createdAt: "asc" },
      with: {
        dependent: {
          with: {
            user: { columns: publicUserColumns },
            rider: true,
            controls: true,
          },
        },
      },
    });

    return links
      .filter((link) => link.dependent.deletedAt === null)
      .map(({ dependent, ...link }) => ({
        relationshipId: link.id,
        memberId: dependent.id,
        name: displayName(dependent),
        dateOfBirth: dependent.dateOfBirth,
        hasLogin: dependent.userId !== null,
        user: dependent.user,
        rider: dependent.rider,
        permissions: parseGuardianPermissions(dependent.controls?.permissions),
        linkedAt: link.createdAt,
      }));
  }
);
