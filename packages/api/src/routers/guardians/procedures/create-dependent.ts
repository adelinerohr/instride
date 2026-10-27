import { MembershipRole } from "@instride/db/enums";
import {
  defaultGuardianPermissions,
  mergeGuardianPermissions,
} from "@instride/db/guardian-permissions";
import { dependentControls } from "@instride/db/schema/guardianship";
import { members } from "@instride/db/schema/organizations";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";

import {
  findMemberInOrg,
  isAdmin,
  linkGuardian,
} from "../../../access/guardianship";
import { organizationProcedure } from "../../../procedures";
import { ensureProfiles } from "../../_shared/profiles";
import { CreateDependentSchema } from "../schemas";

/**
 * Add a dependent who has no login of their own (a child). They become a
 * rider in this organization with the caller as their guardian. Admins can
 * pass `guardianMemberId` to do this for another member.
 */
export const createDependent = organizationProcedure
  .input(CreateDependentSchema)
  .handler(async ({ input, context }) => {
    const guardianMemberId = input.guardianMemberId ?? context.member.id;
    const actingForSomeoneElse = guardianMemberId !== context.member.id;

    if (actingForSomeoneElse && !isAdmin(context.member)) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only admins can add a dependent for another member",
      });
    }
    if (actingForSomeoneElse) {
      await findMemberInOrg(
        context.db,
        context.organization.id,
        guardianMemberId
      );
    }

    return await context.db.transaction(async (tx) => {
      const [dependent] = await tx
        .insert(members)
        .values({
          organizationId: context.organization.id,
          userId: null,
          name: input.name,
          dateOfBirth: input.dateOfBirth ?? null,
          roles: [MembershipRole.RIDER],
          onboardingComplete: true,
        })
        .returning();
      if (!dependent) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }

      await ensureProfiles(tx, dependent);
      const link = await linkGuardian(tx, {
        organizationId: context.organization.id,
        guardianMemberId,
        dependentMemberId: dependent.id,
        consentGivenByMemberId: context.member.id,
      });

      if (input.permissions) {
        const permissions = mergeGuardianPermissions(
          defaultGuardianPermissions,
          input.permissions
        );
        await tx
          .update(dependentControls)
          .set({ permissions, updatedByMemberId: context.member.id })
          .where(eq(dependentControls.memberId, dependent.id));
      }

      return { dependent, relationship: link };
    });
  });
