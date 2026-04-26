import type { Activity, ActivityMetadata } from "@instride/api/contracts";

import { AuthUserRow } from "@/services/auth/schema";
import { toMemberSummary } from "@/services/organizations/mappers";
import { MemberRow } from "@/services/organizations/schema";
import { assertExists } from "@/shared/utils/validation";

import type { ActivityRow } from "./schema";

export function toActivity(
  row: ActivityRow & {
    actorMember: (MemberRow & { authUser: AuthUserRow | null }) | null;
  }
): Activity {
  let actorMember = null;
  if (row.actorMember) {
    assertExists(row.actorMember.authUser, "Actor member has no auth user");
    actorMember = toMemberSummary(row.actorMember);
  }

  return {
    id: row.id,
    organizationId: row.organizationId,
    actorMemberId: row.actorMemberId,
    ownerMemberId: row.ownerMemberId,
    trainerId: row.trainerId,
    riderId: row.riderId,
    subjectType: row.subjectType,
    subjectId: row.subjectId,
    type: row.type,
    metadata: row.metadata as ActivityMetadata,
    createdAt: row.createdAt,
    actorMember,
  };
}
