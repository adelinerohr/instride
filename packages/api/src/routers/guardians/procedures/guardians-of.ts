import { ORPCError } from "@orpc/server";

import {
  findActiveLink,
  findMemberInOrg,
  isStaff,
} from "../../../access/guardianship";
import { organizationProcedure } from "../../../procedures";
import { displayName, publicUserColumns } from "../../_shared/members";
import { DependentMemberSchema } from "../schemas";

/**
 * A dependent's active guardians. Visible to the dependent themselves, to any
 * of their guardians, and to staff (admins and trainers need to know who to call).
 */
export const guardiansOf = organizationProcedure
  .input(DependentMemberSchema)
  .handler(async ({ input, context }) => {
    const dependent = await findMemberInOrg(
      context.db,
      context.organization.id,
      input.dependentMemberId
    );

    const isSelf = dependent.id === context.member.id;
    const allowed =
      isSelf ||
      isStaff(context.member) ||
      (await findActiveLink(context.db, context.member.id, dependent.id)) !==
        undefined;

    if (!allowed) {
      throw new ORPCError("FORBIDDEN", {
        message: "You can't view this member's guardians",
      });
    }

    const links = await context.db.query.guardianRelationships.findMany({
      where: { dependentMemberId: dependent.id, revokedAt: { isNull: true } },
      orderBy: { createdAt: "asc" },
      with: { guardian: { with: { user: { columns: publicUserColumns } } } },
    });

    return links.map(({ guardian, ...link }) => ({
      relationshipId: link.id,
      memberId: guardian.id,
      name: displayName(guardian),
      user: guardian.user,
      linkedAt: link.createdAt,
    }));
  });
