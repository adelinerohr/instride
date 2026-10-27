import { MembershipRole } from "@instride/db/enums";

import { roleProcedure } from "../../../procedures";

/** All active members of the current organization. */
export const list = roleProcedure(
  MembershipRole.ADMIN,
  MembershipRole.TRAINER
).handler(async ({ context }) => {
  return await context.db.query.members.findMany({
    where: {
      organizationId: context.organization.id,
      deletedAt: { isNull: true },
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
        },
      },
      trainer: true,
      rider: true,
    },
  });
});
