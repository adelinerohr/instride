import { EventScope } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { boards } from "@/services/boards/schema";
import {
  members,
  organizations,
  trainers,
} from "@/services/organizations/schema";
import { timeStamps } from "@/shared/utils/schema";

export const eventScopeEnum = p.pgEnum("event_scope", EventScope);

export const events = p.pgTable(
  "events",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: p.text("title").notNull(),
    description: p.text("description"),
    startDate: p.date("start_date").notNull(),
    endDate: p.date("end_date").notNull(),
    startTime: p.time("start_time"), // null = all day
    endTime: p.time("end_time"), // null = all day
    blockScheduling: p.boolean("block_scheduling").notNull().default(false),
    createdByMemberId: p
      .uuid("created_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    ...timeStamps,
  },
  (table) => [p.index("events_organizationId_idx").on(table.organizationId)]
);

export const eventSchedulingBlocks = p.pgTable(
  "event_scheduling_blocks",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    eventId: p
      .uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    scope: eventScopeEnum("scope").notNull(),
    boardId: p
      .uuid("board_id")
      .references(() => boards.id, { onDelete: "cascade" }),
    trainerId: p
      .uuid("trainer_id")
      .references(() => trainers.id, { onDelete: "cascade" }),
  },
  (table) => [
    p.index("eventSchedulingBlocks_eventId_idx").on(table.eventId),
    p.index("eventSchedulingBlocks_boardId_idx").on(table.boardId),
    p.index("eventSchedulingBlocks_trainerId_idx").on(table.trainerId),
  ]
);

export type EventSchedulingBlockRow = typeof eventSchedulingBlocks.$inferSelect;
export type NewEventSchedulingBlockRow =
  typeof eventSchedulingBlocks.$inferInsert;

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
