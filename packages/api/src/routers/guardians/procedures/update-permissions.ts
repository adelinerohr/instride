import { mergeGuardianPermissions } from "@instride/db/guardian-permissions";
import { dependentControls } from "@instride/db/schema/guardianship";

import {
  assertCanManageDependent,
  getDependentPermissions,
} from "../../../access/guardianship";
import { organizationProcedure } from "../../../procedures";
import { UpdatePermissionsSchema } from "../schemas";

/**
 * Change what a dependent may do on their own. Send only the toggles you're
 * changing; everything else keeps its current value. Applies to all of the
 * dependent's guardians (permissions belong to the dependent, not the link).
 */
export const updatePermissions = organizationProcedure
  .input(UpdatePermissionsSchema)
  .handler(async ({ input, context }) => {
    const { dependent } = await assertCanManageDependent(
      context.db,
      context.member,
      input.dependentMemberId
    );

    const current = await getDependentPermissions(context.db, dependent.id);
    const permissions = mergeGuardianPermissions(current, input.permissions);

    await context.db
      .insert(dependentControls)
      .values({
        memberId: dependent.id,
        organizationId: context.organization.id,
        permissions,
        updatedByMemberId: context.member.id,
      })
      .onConflictDoUpdate({
        target: dependentControls.memberId,
        set: { permissions, updatedByMemberId: context.member.id },
      });

    return permissions;
  });
