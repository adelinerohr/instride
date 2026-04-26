import { WaiverStatus } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { organizations } from "@/database/schema";

export const waiverStatusEnum = p.pgEnum("waiver_status", WaiverStatus);

/**
 * WAIVERS
 * Liability waivers signed by members
 */
export const waivers = p.pgTable(
  "waivers",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    title: p.text("title").notNull(),
    content: p.text("content").notNull(),
    version: p.text("version").notNull().default("1"),
    status: waiverStatusEnum("status").notNull().default(WaiverStatus.ACTIVE),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [p.index("waivers_organization_idx").on(table.organizationId)]
);

export type WaiverRow = typeof waivers.$inferSelect;
export type NewWaiverRow = typeof waivers.$inferInsert;
