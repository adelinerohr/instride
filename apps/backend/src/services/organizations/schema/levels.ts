import * as p from "drizzle-orm/pg-core";

import { organizations } from "@/database/schema";

export const levels = p.pgTable(
  "levels",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: p.text("name").notNull(),
    description: p.text("description"),
    color: p.text("color").notNull(),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [p.index("levels_organizationId_idx").on(table.organizationId)]
);

export type Level = typeof levels.$inferSelect;
export type NewLevel = typeof levels.$inferInsert;
