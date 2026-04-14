import * as p from "drizzle-orm/pg-core";

import {
  organizations,
  boards,
  dayOfWeekEnum,
  trainers,
} from "@/database/schema";
import { timeStamps } from "@/shared/utils/schema";

/**
 * ---------------------------------------------------------------------------
 * ORGANIZATION AVAILABILITY
 * Organization-wide defaults, optionally board-specific
 * ---------------------------------------------------------------------------
 * Each row = one day for the organization (boardId null = org default)
 * A board row overrides the org default for that day/board
 *
 * Hierarchy: org default → board override
 * ---------------------------------------------------------------------------
 */
export const organizationAvailability = p.pgTable(
  "organization_availability",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // null = org-wide default; non-null = board-specific override
    boardId: p
      .uuid("board_id")
      .references(() => boards.id, { onDelete: "cascade" }),
    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
    isOpen: p.boolean("is_open").notNull().default(false),

    // null when isOpen = false
    openTime: p.time({ withTimezone: true }),
    closeTime: p.time({ withTimezone: true }),

    ...timeStamps,
  },
  (table) => [
    p
      .unique("org_avail_organization_board_day_unique")
      .on(table.organizationId, table.boardId, table.dayOfWeek),
    p.index("org_avail_organization_idx").on(table.organizationId),
    p
      .index("org_avail_organization_day_idx")
      .on(table.organizationId, table.dayOfWeek),
    p.index("org_avail_board_idx").on(table.boardId),
    p
      .index("org_avail_organization_board_idx")
      .on(table.organizationId, table.boardId),
    p
      .index("org_avail_organization_day_board_idx")
      .on(table.organizationId, table.dayOfWeek, table.boardId),
  ]
);

/**
 * ---------------------------------------------------------------------------
 * TRAINER AVAILABILITY
 * Trainer-specific overrides of org/board hours
 * ---------------------------------------------------------------------------
 * Hierarchy: effective org/board hours → trainer override (clamped)
 *
 * boardId null = trainer's general availability (fallback for all boards)
 * boardId non-null = trainer's override for that specific board
 *
 * inheritsFromOrg: true → use the effective org/board hours; rows can still
 * exist to store last-set custom times but are NOT applied.
 * ---------------------------------------------------------------------------
 */
export const trainerAvailability = p.pgTable(
  "trainer_availability",
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

    // null = general/default for all boards; non-null = board-specific
    boardId: p
      .uuid("board_id")
      .references(() => boards.id, { onDelete: "cascade" }),
    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),

    // When try this day uses the effective org/board hours (no custom times)
    inheritsFromOrg: p.boolean("inherits_from_org").notNull().default(true),
    isOpen: p.boolean("is_open").notNull().default(false),

    // null when inheritsFromOrg = true or isOpen = false
    openTime: p.time({ withTimezone: true }),
    closeTime: p.time({ withTimezone: true }),

    ...timeStamps,
  },
  (table) => [
    p.index("trainer_avail_organization_idx").on(table.organizationId),
    p
      .index("trainer_avail_organization_trainer_idx")
      .on(table.organizationId, table.trainerId),
    p.index("trainer_avail_trainer_idx").on(table.trainerId),
    p.index("trainer_avail_board_idx").on(table.boardId),
    p
      .index("trainer_avail_trainer_board_idx")
      .on(table.trainerId, table.boardId),
    p
      .index("trainer_avail_trainer_day_idx")
      .on(table.trainerId, table.dayOfWeek),
    p
      .index("trainer_avail_trainer_day_board_idx")
      .on(table.trainerId, table.dayOfWeek, table.boardId),
  ]
);

export type OrganizationAvailability =
  typeof organizationAvailability.$inferSelect;
export type NewOrganizationAvailability =
  typeof organizationAvailability.$inferInsert;

export type TrainerAvailability = typeof trainerAvailability.$inferSelect;
export type NewTrainerAvailability = typeof trainerAvailability.$inferInsert;
