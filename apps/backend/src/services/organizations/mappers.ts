import type {
  Invitation,
  Member,
  MemberSummary,
  Rider,
  Trainer,
} from "@instride/api/contracts";
import { InvitationStatus, MembershipRole } from "@instride/shared";

import { assertExists } from "@/shared/utils/validation";

import { AuthUserRow } from "../auth/schema";
import { toBoardAssignmentSummary } from "../boards/mappers";
import {
  AuthInvitationRow,
  LevelRow,
  MemberRow,
  RiderRow,
  TrainerRow,
} from "./schema";

export function toMemberSummary(
  row: MemberRow & {
    authUser: AuthUserRow | null;
  }
): MemberSummary {
  assertExists(row.authUser, "Member has no auth user");

  return {
    ...row,
    authUser: row.authUser,
  };
}

export function toMember(
  row: MemberRow & {
    authUser: AuthUserRow | null;
    rider: RiderRow | null;
    trainer: TrainerRow | null;
  }
): Member {
  assertExists(row.authUser, "Member has no auth user");

  return {
    ...row,
    authUser: row.authUser,
  };
}

export function toRider(
  row: RiderRow & {
    level: LevelRow | null;
    member: Parameters<typeof toMemberSummary>[0] | null;
    boardAssignments: Array<Parameters<typeof toBoardAssignmentSummary>[0]>;
  }
): Rider {
  assertExists(row.member, "Rider has no member");

  return {
    ...row,
    member: toMemberSummary(row.member),
    boardAssignments: row.boardAssignments.map(toBoardAssignmentSummary),
  };
}

export function toTrainer(
  row: TrainerRow & {
    member: Parameters<typeof toMemberSummary>[0] | null;
    boardAssignments: Array<Parameters<typeof toBoardAssignmentSummary>[0]>;
  }
): Trainer {
  assertExists(row.member, "Trainer has no member");

  return {
    ...row,
    member: toMemberSummary(row.member),
    boardAssignments: row.boardAssignments.map(toBoardAssignmentSummary),
  };
}

export function toInvitation(row: AuthInvitationRow): Invitation {
  return {
    ...row,
    role: row.role?.split(",") as MembershipRole[],
    status: row.status.toLowerCase() as InvitationStatus,
  };
}
