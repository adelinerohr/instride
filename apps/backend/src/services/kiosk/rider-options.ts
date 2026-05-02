import type { Member, Rider } from "@instride/api/contracts";
// apps/backend/src/services/kiosk/rider-options.ts
import { MembershipRole } from "@instride/shared";

import { memberRepo } from "@/services/organizations/members/member.repo";

import { guardianRepo } from "../guardians/guardian.repo";
import { toMyDependent } from "../guardians/mappers";

interface LoadRiderOptionsInput {
  organizationId: string;
  /** Pre-loaded member (caller already needed it for other reasons). */
  member: Member;
  /** Board the kiosk is scoped to. Null = org-wide for staff. */
  boardId: string | null;
}

/**
 * Returns the riders a member can act on through the kiosk, *unfiltered by
 * action*. Frontend filters further by action-specific permissions.
 *
 *   - Staff: all riders in the org (or board-scoped if boardId is set).
 *   - Guardian (no own rider): active dependents.
 *   - Guardian + own rider: themselves + active dependents.
 *   - Plain rider / restricted dependent: just themselves.
 *
 * Staff role wins over guardian role — at the kiosk staff act in their staff
 * capacity.
 */
export async function loadRiderOptionsForMember(
  input: LoadRiderOptionsInput
): Promise<Rider[]> {
  const { organizationId, member, boardId } = input;

  const isStaff =
    member.roles.includes(MembershipRole.ADMIN) ||
    member.roles.includes(MembershipRole.TRAINER);

  if (isStaff) {
    return boardId
      ? await memberRepo.findManyRiders(organizationId, { boardId })
      : await memberRepo.findManyRiders(organizationId);
  }

  const isGuardian = member.roles.includes(MembershipRole.GUARDIAN);

  if (isGuardian) {
    const dependents = await guardianRepo
      .listMyDependents({
        guardianMemberId: member.id,
        organizationId,
      })
      .then((rows) => rows.map(toMyDependent));

    const dependentRiders = dependents.map((d) => d.rider);

    return member.rider ? [member.rider, ...dependentRiders] : dependentRiders;
  }

  return member.rider ? [member.rider] : [];
}
