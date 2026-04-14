import * as p from "drizzle-orm/pg-core";

import { organizations, boards, trainers } from "@/database/schema";
import { timeStamps } from "@/shared/utils/schema";

/**
 * TIME BLOCKS
 * Explicit busy/blocked time for a trainer
 * Used to block off time that shouldn't be scheduled for lessons
 */
export const timeBlocks = p.pgTable(
  "time_blocks",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    trainerId: p
      .uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "cascade" }),
    boardId: p
      .uuid("board_id")
      .references(() => boards.id, { onDelete: "cascade" }),
    start: p.timestamp("start", { withTimezone: true }).notNull(),
    end: p.timestamp("end", { withTimezone: true }).notNull(),
    reason: p.text("reason"),

    ...timeStamps,
  },
  (table) => [
    p.index("time_blocks_organization_idx").on(table.organizationId),
    p.index("time_blocks_trainer_idx").on(table.trainerId),
    p.index("time_blocks_board_idx").on(table.boardId),
    p.index("time_blocks_trainer_board_idx").on(table.trainerId, table.boardId),
    p
      .index("time_blocks_organization_start_idx")
      .on(table.organizationId, table.start),
  ]
);

export type TimeBlock = typeof timeBlocks.$inferSelect;
export type NewTimeBlock = typeof timeBlocks.$inferInsert;
