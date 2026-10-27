import { InvitationStatus, MembershipRole } from "@instride/db/enums";
import { invitations } from "@instride/db/schema/organizations";
import { and, eq } from "drizzle-orm";

import { roleProcedure } from "../../../procedures";
import { InvitationIdSchema } from "../schemas";

export const revoke = roleProcedure(MembershipRole.ADMIN)
  .input(InvitationIdSchema)
  .handler(async ({ input, context }) => {
    await context.db
      .update(invitations)
      .set({ status: InvitationStatus.REVOKED })
      .where(
        and(
          eq(invitations.id, input.invitationId),
          eq(invitations.organizationId, context.organization.id)
        )
      );
    return { ok: true as const };
  });
