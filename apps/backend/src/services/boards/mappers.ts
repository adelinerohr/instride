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
  toRiderSummary,
  toTrainerSummary,
  RiderSummaryRow,
  TrainerSummaryRow,
} from "../organizations/mappers";
import { LevelRow } from "../organizations/schema";
import {
  BoardAssignmentRow,
  BoardRow,
  ServiceBoardAssignmentRow,
  ServiceRow,
  ServiceTrainerAssignmentRow,
} from "./schema";

// ---------------------------------------------------------------------------
// Augmented row types (row + relations as fetched via fragments)
// ---------------------------------------------------------------------------

export type BoardAssignmentSummaryRow = BoardAssignmentRow & {
  board: BoardRow | null;
};

export type BoardAssignmentWithExpansionRow = BoardAssignmentRow & {
  trainer: TrainerSummaryRow | null;
  rider: RiderSummaryRow | null;
};

export type BoardWithExpansionRow = BoardRow & {
  assignments: BoardAssignmentWithExpansionRow[] | null;
  serviceBoardAssignments: ServiceBoardAssignmentRow[] | null;
};

export type ServiceWithExpansionRow = ServiceRow & {
  restrictedToLevel: LevelRow | null;
  boardAssignments: ServiceBoardAssignmentRow[];
  trainerAssignments: ServiceTrainerAssignmentRow[];
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function toBoardAssignmentSummary(
  row: BoardAssignmentSummaryRow
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

export function toBoard(row: BoardWithExpansionRow): Board {
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
  row: BoardAssignmentWithExpansionRow
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
