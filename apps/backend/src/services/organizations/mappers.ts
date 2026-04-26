import type {
  Invitation,
  Level,
  Member,
  MemberSummary,
  Organization,
  Rider,
  RiderProfile,
  RiderSummary,
  Trainer,
  TrainerProfile,
  TrainerSummary,
} from "@instride/api/contracts";
import { InvitationStatus } from "@instride/shared";

import { toISO, toISOOrNull, toTimestamps } from "@/shared/utils/mappers";
import { assertExists } from "@/shared/utils/validation";

import { toAuthUser } from "../auth/mappers";
import { AuthUserRow } from "../auth/schema";
import { toBoardAssignmentSummary } from "../boards/mappers";
import {
  AuthInvitationRow,
  LevelRow,
  MemberRow,
  OrganizationRow,
  RiderRow,
  TrainerRow,
} from "./schema";

export function toOrganization(row: OrganizationRow): Organization {
  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toMemberSummary(
  row: MemberRow & {
    authUser: AuthUserRow | null;
  }
): MemberSummary {
  assertExists(row.authUser, "Member has no auth user");

  return {
    ...row,
    deletedAt: toISOOrNull(row.deletedAt),
    authUser: toAuthUser(row.authUser),
    ...toTimestamps(row.createdAt, row.updatedAt),
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
    rider: row.rider ? toRiderProfile(row.rider) : null,
    trainer: row.trainer ? toTrainerProfile(row.trainer) : null,
    authUser: toAuthUser(row.authUser),
    deletedAt: toISOOrNull(row.deletedAt),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toLevel(row: LevelRow): Level {
  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toRiderSummary(
  row: RiderRow & { member: Parameters<typeof toMemberSummary>[0] | null }
): RiderSummary {
  assertExists(row.member, "Rider has no member");

  return {
    ...toRiderProfile(row),
    member: toMemberSummary(row.member),
  };
}

export function toRiderProfile(row: RiderRow): RiderProfile {
  return {
    ...row,
    deletedAt: toISOOrNull(row.deletedAt),
    ...toTimestamps(row.createdAt, row.updatedAt),
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
    level: row.level ? toLevel(row.level) : null,
    deletedAt: toISOOrNull(row.deletedAt),
    member: toMemberSummary(row.member),
    boardAssignments: row.boardAssignments.map(toBoardAssignmentSummary),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toTrainerSummary(
  row: TrainerRow & { member: Parameters<typeof toMemberSummary>[0] | null }
): TrainerSummary {
  assertExists(row.member, "Trainer has no member");

  return {
    ...toTrainerProfile(row),
    member: toMemberSummary(row.member),
  };
}
export function toTrainerProfile(row: TrainerRow): TrainerProfile {
  return {
    ...row,
    deletedAt: toISOOrNull(row.deletedAt),
    ...toTimestamps(row.createdAt, row.updatedAt),
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
    deletedAt: toISOOrNull(row.deletedAt),
    member: toMemberSummary(row.member),
    boardAssignments: row.boardAssignments.map(toBoardAssignmentSummary),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toInvitation(row: AuthInvitationRow): Invitation {
  return {
    ...row,
    expiresAt: toISO(row.expiresAt),
    createdAt: toISO(row.createdAt),
    status: row.status.toLowerCase() as InvitationStatus,
  };
}
