import { and, eq, isNotNull } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { boardAssignmentExpansion, boardExpansion } from "./fragments";
import {
  BoardAssignmentRow,
  boardAssignments,
  BoardRow,
  boards,
  NewBoardAssignmentRow,
  NewBoardRow,
} from "./schema";

export const createBoardService = (client: Database | Transaction = db) => ({
  create: async (data: NewBoardRow) => {
    const [board] = await client.insert(boards).values(data).returning();
    assertExists(board, "Board not created");
    return board;
  },

  findOne: async (id: string, organizationId: string) => {
    const board = await client.query.boards.findFirst({
      where: { id, organizationId },
      with: boardExpansion,
    });
    assertExists(board, "Board not found");
    return board;
  },

  findMany: async () => {
    const boards = await client.query.boards.findMany();
    return boards;
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<BoardRow>
  ) => {
    const [board] = await client
      .update(boards)
      .set(data)
      .where(and(eq(boards.id, id), eq(boards.organizationId, organizationId)))
      .returning();
    assertExists(board, "Board not updated");
    return board;
  },

  delete: async (id: string, organizationId: string) => {
    const result = await client
      .delete(boards)
      .where(and(eq(boards.id, id), eq(boards.organizationId, organizationId)));
    assertExists(result, "Board not deleted");
    return result;
  },

  createAssignment: async (data: NewBoardAssignmentRow) => {
    const [assignment] = await client
      .insert(boardAssignments)
      .values(data)
      .returning();
    assertExists(assignment, "Board assignment not created");
    return assignment;
  },

  bulkCreateAssignments: async (data: NewBoardAssignmentRow[]) => {
    const assignments = await client
      .insert(boardAssignments)
      .values(data)
      .returning();
    assertExists(assignments, "Board assignments not created");
    return assignments;
  },

  findOneAssignment: async (id: string, organizationId: string) => {
    const assignment = await client.query.boardAssignments.findFirst({
      where: { id, organizationId },
      with: boardAssignmentExpansion,
    });
    assertExists(assignment, "Board assignment not found");
    return assignment;
  },

  findManyAssignments: async (
    organizationId: string,
    filter?: "trainer" | "rider"
  ) => {
    const roleFilter =
      filter === "trainer"
        ? { trainerId: { isNotNull: true as const } }
        : filter === "rider"
          ? { riderId: { isNotNull: true as const } }
          : {};
    const assignments = await client.query.boardAssignments.findMany({
      where: {
        organizationId,
        ...roleFilter,
      },
      with: boardAssignmentExpansion,
    });
    return assignments;
  },

  updateAssignment: async (
    id: string,
    organizationId: string,
    data: Partial<BoardAssignmentRow>
  ) => {
    const [assignment] = await client
      .update(boardAssignments)
      .set(data)
      .where(
        and(
          eq(boardAssignments.id, id),
          eq(boardAssignments.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(assignment, "Board assignment not updated");
    return assignment;
  },

  deleteAssignmentById: async (
    assignmentId: string,
    organizationId: string
  ) => {
    const result = await client
      .delete(boardAssignments)
      .where(
        and(
          eq(boardAssignments.id, assignmentId),
          eq(boardAssignments.organizationId, organizationId)
        )
      );
    assertExists(result, "Board assignment not deleted");
    return result;
  },

  deleteAssignmentByBoard: async (
    boardId: string,
    organizationId: string,
    type: "trainer" | "rider"
  ) => {
    const result = await client
      .delete(boardAssignments)
      .where(
        and(
          eq(boardAssignments.boardId, boardId),
          eq(boardAssignments.organizationId, organizationId),
          isNotNull(
            type === "trainer"
              ? boardAssignments.trainerId
              : boardAssignments.riderId
          )
        )
      );
    assertExists(result, "Board assignment not deleted");
    return result;
  },
});

export const boardService = createBoardService();
