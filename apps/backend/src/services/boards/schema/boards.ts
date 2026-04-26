import * as p from "drizzle-orm/pg-core";

import { organizations } from "@/database/schema";

/**
 * BOARDS
 * Physical or virtual arenas/locations within a facility
 */
export const boards = p.pgTable(
  "boards",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: p.text("name").notNull(),

    // whether riders can add themselves to this board
    canRiderAdd: p.boolean("can_rider_add").notNull().default(false),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [p.index("boards_organizationId_idx").on(table.organizationId)]
);

export type BoardRow = typeof boards.$inferSelect;
export type NewBoardRow = typeof boards.$inferInsert;
