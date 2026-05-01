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
import {
  BoardAssignmentSummaryRow,
  toBoardAssignmentSummary,
} from "../boards/mappers";
import {
  AuthInvitationRow,
  LevelRow,
  MemberRow,
  OrganizationRow,
  RiderRow,
  TrainerRow,
} from "./schema";

// ---------------------------------------------------------------------------
// Augmented row types (row + relations as fetched via fragments)
// ---------------------------------------------------------------------------

export type MemberSummaryRow = MemberRow & { authUser: AuthUserRow | null };

export type MemberWithAuthAndRolesRow = MemberSummaryRow & {
  rider: RiderWithExpansionRow | null;
  trainer: TrainerWithExpansionRow | null;
};

export type RiderSummaryRow = RiderRow & {
  member: MemberSummaryRow | null;
};

export type RiderWithExpansionRow = RiderRow & {
  level: LevelRow | null;
  member: MemberSummaryRow | null;
  boardAssignments: BoardAssignmentSummaryRow[];
};

export type TrainerSummaryRow = TrainerRow & {
  member: MemberSummaryRow | null;
};

export type TrainerWithExpansionRow = TrainerRow & {
  member: MemberSummaryRow | null;
  boardAssignments: BoardAssignmentSummaryRow[];
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function toOrganization(row: OrganizationRow): Organization {
  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toMemberSummary(row: MemberSummaryRow): MemberSummary {
  assertExists(row.authUser, "Member has no auth user");

  return {
    ...row,
    deletedAt: toISOOrNull(row.deletedAt),
    authUser: toAuthUser(row.authUser),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toMember(row: MemberWithAuthAndRolesRow): Member {
  assertExists(row.authUser, "Member has no auth user");

  return {
    ...row,
    rider: row.rider ? toRider(row.rider) : null,
    trainer: row.trainer ? toTrainer(row.trainer) : null,
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

export function toRiderSummary(row: RiderSummaryRow): RiderSummary {
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

export function toRider(row: RiderWithExpansionRow): Rider {
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

export function toTrainerSummary(row: TrainerSummaryRow): TrainerSummary {
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

export function toTrainer(row: TrainerWithExpansionRow): Trainer {
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
