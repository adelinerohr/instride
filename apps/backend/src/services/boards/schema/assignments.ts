import * as p from "drizzle-orm/pg-core";

import { organizations, riders, trainers } from "@/database/schema";

import { boards } from "./boards";

/**
 * BOARD ASSIGNMENTS
 * Which members (trainers/riders) have access to which boards
 */
export const boardAssignments = p.pgTable(
  "board_assignments",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    boardId: p
      .uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    trainerId: p
      .uuid("trainer_id")
      .references(() => trainers.id, { onDelete: "cascade" }),
    riderId: p
      .uuid("rider_id")
      .references(() => riders.id, { onDelete: "cascade" }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    p.index("board_assignments_board_id_idx").on(table.boardId),
    p.index("board_assignments_organizationId_idx").on(table.organizationId),
    p.index("board_assignments_trainerId_idx").on(table.trainerId),
    p.index("board_assignments_riderId_idx").on(table.riderId),
    p
      .index("board_assignments_board_role_idx")
      .on(table.boardId, table.trainerId, table.riderId),
  ]
);

export type BoardAssignmentRow = typeof boardAssignments.$inferSelect;
export type NewBoardAssignmentRow = typeof boardAssignments.$inferInsert;
