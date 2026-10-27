import { InvitationKind, MembershipRole } from "@instride/db/enums";

import { roleProcedure } from "../../../procedures";
import { createInvitation } from "../../_shared/invitations";
import { CreateInvitationSchema } from "../schemas";

/** Admin invites someone to join the organization. Guardian invites live in the guardians router. */
export const create = roleProcedure(MembershipRole.ADMIN)
  .input(CreateInvitationSchema)
  .handler(async ({ input, context }) => {
    return await createInvitation(context.db, {
      organizationId: context.organization.id,
      kind: InvitationKind.MEMBER,
      email: input.email,
      roles: input.roles,
      invitedByUserId: context.user.id,
    });
  });
