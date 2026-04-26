import {
  Board,
  BoardAssignment,
  BoardAssignmentSummary,
  Level,
  RiderWithMember,
  Service,
  TrainerWithMember,
} from "@instride/api/contracts";

import { toISO } from "@/shared/utils/mappers";
import { assertExists } from "@/shared/utils/validation";

import { toMemberSummary } from "../organizations/mappers";
import { RiderRow, TrainerRow } from "../organizations/schema";
import {
  BoardAssignmentRow,
  BoardRow,
  ServiceBoardAssignmentRow,
  ServiceRow,
  ServiceTrainerAssignmentRow,
} from "./schema";

export function toBoardAssignmentSummary(
  row: BoardAssignmentRow & { board: BoardRow | null }
): BoardAssignmentSummary {
  assertExists(row.board, "Board assignment has no board");

  return {
    ...row,
    createdAt: toISO(row.createdAt),
    board: row.board,
  };
}

export function toBoard(
  row: BoardRow & {
    assignments: Parameters<typeof toBoardAssignment>[0][] | null;
    serviceBoardAssignments: ServiceBoardAssignmentRow[] | null;
  }
): Board {
  assertExists(row.assignments, "Board has no assignments");
  assertExists(
    row.serviceBoardAssignments,
    "Board has no service board assignments"
  );

  return {
    ...row,
    assignments: row.assignments.map(toBoardAssignment),
    serviceBoardAssignments: row.serviceBoardAssignments,
  };
}

export function toBoardAssignment(
  row: BoardAssignmentRow & {
    trainer:
      | (TrainerRow & { member: Parameters<typeof toMemberSummary>[0] | null })
      | null;
    rider:
      | (RiderRow & { member: Parameters<typeof toMemberSummary>[0] | null })
      | null;
  }
): BoardAssignment {
  let trainer: TrainerWithMember | null = null;
  let rider: RiderWithMember | null = null;

  if (row.trainer) {
    assertExists(row.trainer.member, "Trainer has no member");
    trainer = {
      ...row.trainer,
      member: toMemberSummary(row.trainer.member),
    };
  }

  if (row.rider) {
    assertExists(row.rider.member, "Rider has no member");
    rider = {
      ...row.rider,
      member: toMemberSummary(row.rider.member),
    };
  }

  return {
    ...row,
    trainer,
    rider,
  };
}

export function toService(
  row: ServiceRow & {
    restrictedToLevel: Level | null;
    boardAssignments: ServiceBoardAssignmentRow[];
    trainerAssignments: ServiceTrainerAssignmentRow[];
  }
): Service {
  return {
    ...row,
    restrictedToLevel: row.restrictedToLevel,
    boardAssignments: row.boardAssignments,
    trainerAssignments: row.trainerAssignments,
  };
}
