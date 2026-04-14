import {
  DayOfWeek,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import {
  organizations,
  members,
  boards,
  levels,
  services,
  trainers,
} from "@/database/schema";

export const recurrenceFrequencyEnum = p.pgEnum(
  "recurrence_frequency",
  RecurrenceFrequency
);
export const dayOfWeekEnum = p.pgEnum("day_of_week", DayOfWeek);
export const seriesStatusEnum = p.pgEnum("series_status", LessonSeriesStatus);

/**
 * LESSON SERIES
 * Template for recurring or one-off lessons
 */
export const lessonSeries = p.pgTable(
  "lesson_series",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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

    // display
    name: p.text("name"),
    notes: p.text("notes"),

    // schedule — anchor time for recurrence
    start: p.timestamp("start", { withTimezone: true }).notNull(),
    duration: p.integer("duration").notNull(), // minutes
    maxRiders: p.integer("max_riders").notNull(),

    // recurrence
    isRecurring: p.boolean("is_recurring").notNull().default(false),
    recurrenceFrequency: recurrenceFrequencyEnum("recurrence_frequency"),
    recurrenceByDay: dayOfWeekEnum("recurrence_by_day").array(), // e.g. ['MON', 'WED']
    recurrenceEnd: p.timestamp("recurrence_end", { withTimezone: true }),

    // status
    status: seriesStatusEnum("status").notNull().default("active"),
    effectiveFrom: p.timestamp("effective_from", { withTimezone: true }),
    lastPlannedUntil: p.timestamp("last_planned_until", { withTimezone: true }),

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
    p.index("lesson_series_organizationId_idx").on(table.organizationId),
    p
      .index("lesson_series_organizationId_status_idx")
      .on(table.organizationId, table.status),
    p.index("lesson_series_board_id_idx").on(table.boardId),
    p.index("lesson_series_trainer_idx").on(table.trainerId),
    p
      .index("lesson_series_trainer_status_idx")
      .on(table.trainerId, table.status),
  ]
);

export type LessonSeries = typeof lessonSeries.$inferSelect;
export type NewLessonSeries = typeof lessonSeries.$inferInsert;
