import { and, eq } from "drizzle-orm";

import { Database } from "@/shared/utils/schema";
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

export const createBoardService = (client: Database = db) => ({
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

  update: async (id: string, data: Partial<BoardRow>) => {
    const [board] = await client
      .update(boards)
      .set(data)
      .where(eq(boards.id, id))
      .returning();
    assertExists(board, "Board not updated");
    return board;
  },

  delete: async (id: string) => {
    const result = await client.delete(boards).where(eq(boards.id, id));
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

  updateAssignment: async (id: string, data: Partial<BoardAssignmentRow>) => {
    const [assignment] = await client
      .update(boardAssignments)
      .set(data)
      .where(eq(boardAssignments.id, id))
      .returning();
    assertExists(assignment, "Board assignment not updated");
    return assignment;
  },

  deleteAssignment: async (id: string, organizationId: string) => {
    const result = await client
      .delete(boardAssignments)
      .where(
        and(
          eq(boardAssignments.id, id),
          eq(boardAssignments.organizationId, organizationId)
        )
      );
    assertExists(result, "Board assignment not deleted");
    return result;
  },
});

export const boardService = createBoardService();
