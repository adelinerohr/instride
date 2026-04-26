import {
  Board,
  BoardAssignment,
  BoardAssignmentSummary,
  BoardSummary,
  Service,
  ServiceBoardAssignment,
  ServiceTrainerAssignment,
} from "@instride/api/contracts";

import { toISO, toTimestamps } from "@/shared/utils/mappers";
import { assertExists } from "@/shared/utils/validation";

import {
  toLevel,
  toMemberSummary,
  toRiderSummary,
  toTrainerSummary,
} from "../organizations/mappers";
import { LevelRow, RiderRow, TrainerRow } from "../organizations/schema";
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
    board: toBoardSummary(row.board),
  };
}

export function toBoardSummary(row: BoardRow): BoardSummary {
  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
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
    serviceBoardAssignments: row.serviceBoardAssignments.map(
      toServiceBoardAssignment
    ),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toServiceBoardAssignment(
  row: ServiceBoardAssignmentRow
): ServiceBoardAssignment {
  return {
    ...row,
    createdAt: toISO(row.createdAt),
  };
}

export function toServiceTrainerAssignment(
  row: ServiceTrainerAssignmentRow
): ServiceTrainerAssignment {
  return {
    ...row,
    ...toTimestamps(row.createdAt, row.updatedAt),
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
  const trainer = row.trainer ? toTrainerSummary(row.trainer) : null;
  const rider = row.rider ? toRiderSummary(row.rider) : null;

  return {
    ...row,
    trainer,
    rider,
    createdAt: toISO(row.createdAt),
  };
}

export function toService(
  row: ServiceRow & {
    restrictedToLevel: LevelRow | null;
    boardAssignments: ServiceBoardAssignmentRow[];
    trainerAssignments: ServiceTrainerAssignmentRow[];
  }
): Service {
  return {
    ...row,
    restrictedToLevel: row.restrictedToLevel
      ? toLevel(row.restrictedToLevel)
      : null,
    boardAssignments: row.boardAssignments.map(toServiceBoardAssignment),
    trainerAssignments: row.trainerAssignments.map(toServiceTrainerAssignment),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}
