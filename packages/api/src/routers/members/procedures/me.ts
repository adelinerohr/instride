import { organizationProcedure } from "../../../procedures";

/** The signed-in user's membership in the current organization. */
export const me = organizationProcedure.handler(async ({ context }) => {
  return await context.db.query.members.findFirst({
    where: { id: context.member.id },
    with: { user: true, trainer: true, rider: true },
  });
});
