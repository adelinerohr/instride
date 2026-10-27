import { InvitationStatus, MembershipRole } from "@instride/db/enums";

import { roleProcedure } from "../../../procedures";

/** Pending invitations for the current organization, newest first. */
export const list = roleProcedure(MembershipRole.ADMIN).handler(
  async ({ context }) => {
    return await context.db.query.invitations.findMany({
      where: {
        organizationId: context.organization.id,
        status: InvitationStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });
  }
);
