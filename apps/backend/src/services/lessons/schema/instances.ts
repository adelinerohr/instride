import { LessonInstanceStatus } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import {
  organizations,
  members,
  boards,
  levels,
  services,
  lessonSeries,
  trainers,
} from "@/database/schema";

export const instanceStatusEnum = p.pgEnum(
  "instance_status",
  LessonInstanceStatus
);

/**
 * LESSON INSTANCES
 * Concrete bookable occurrences derived from a series
 */
export const lessonInstances = p.pgTable(
  "lesson_instances",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    seriesId: p
      .uuid("series_id")
      .notNull()
      .references(() => lessonSeries.id, { onDelete: "cascade" }),
    boardId: p
      .uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "restrict" }),
    trainerId: p
      .uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "restrict" }),
    levelId: p
      .uuid("level_id")
      .references(() => levels.id, { onDelete: "set null" }),
    serviceId: p
      .uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),

    // concrete schedule
    start: p.timestamp("start", { withTimezone: true }).notNull(),
    end: p.timestamp("end", { withTimezone: true }).notNull(),
    maxRiders: p.integer("max_riders").notNull(),

    // deduplication key: "{seriesId}:{date}" or "standalone:{uuid}"
    occurrenceKey: p.text("occurrence_key").notNull().unique(),

    // status
    status: instanceStatusEnum("status").notNull().default("scheduled"),
    canceledAt: p.timestamp("canceled_at", { withTimezone: true }),
    canceledByMemberId: p
      .uuid("canceled_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    cancelReason: p.text("cancel_reason"),

    // overrides from series (null = inherit)
    name: p.text("name"),
    notes: p.text("notes"),

    // audit
    createdByMemberId: p
      .uuid("created_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    updatedByMemberId: p
      .uuid("updated_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("lesson_instances_organizationId_idx").on(table.organizationId),
    p
      .index("lesson_instances_organizationId_start_idx")
      .on(table.organizationId, table.start),
    p
      .index("lesson_instances_organizationId_status_idx")
      .on(table.organizationId, table.status),
    p.index("lesson_instances_series_id_idx").on(table.seriesId),
    p.index("lesson_instances_board_id_idx").on(table.boardId),
    p.index("lesson_instances_board_start_idx").on(table.boardId, table.start),
    p.index("lesson_instances_trainer_idx").on(table.trainerId),
    p
      .index("lesson_instances_trainer_start_idx")
      .on(table.trainerId, table.start),
    p
      .index("lesson_instances_trainer_status_start_idx")
      .on(table.trainerId, table.status, table.start),
  ]
);

export type LessonInstance = typeof lessonInstances.$inferSelect;
export type NewLessonInstance = typeof lessonInstances.$inferInsert;
