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
 *
 * The unique constraint uses NULLS NOT DISTINCT so that org-wide rows
 * (boardId = NULL) still participate in uniqueness — otherwise every save
 * of org defaults would silently insert duplicate rows instead of updating.
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

    ...timeStamps,
  },
  (table) => [
    p
      .unique("org_avail_organization_board_day_unique")
      .on(table.organizationId, table.boardId, table.dayOfWeek)
      .nullsNotDistinct(),
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

export const organizationAvailabilitySlots = p.pgTable(
  "organization_availability_slots",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    availabilityId: p
      .uuid("availability_id")
      .notNull()
      .references(() => organizationAvailability.id, { onDelete: "cascade" }),
    openTime: p.time({ withTimezone: true }).notNull(),
    closeTime: p.time({ withTimezone: true }).notNull(),
    ...timeStamps,
  },
  (table) => [
    p.index("org_avail_slots_availability_idx").on(table.availabilityId),
  ]
);

/**
 * ---------------------------------------------------------------------------
 * TRAINER AVAILABILITY
 * Trainer-specific hours, optionally board-specific
 * ---------------------------------------------------------------------------
 * Hierarchy: effective org/board hours → trainer override (clamped)
 *
 * boardId null = trainer's general availability (fallback for all boards)
 * boardId non-null = trainer's override for that specific board
 *
 * Same NULLS NOT DISTINCT reasoning as organizationAvailability applies to
 * the trainer-defaults (boardId = NULL) rows.
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
    isOpen: p.boolean("is_open").notNull().default(false),

    ...timeStamps,
  },
  (table) => [
    p
      .unique("trainer_avail_trainer_board_day_unique")
      .on(table.trainerId, table.boardId, table.dayOfWeek)
      .nullsNotDistinct(),
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

export const trainerAvailabilitySlots = p.pgTable(
  "trainer_availability_slots",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    availabilityId: p
      .uuid("trainer_availability_id")
      .notNull()
      .references(() => trainerAvailability.id, { onDelete: "cascade" }),
    openTime: p.time({ withTimezone: true }).notNull(),
    closeTime: p.time({ withTimezone: true }).notNull(),
    ...timeStamps,
  },
  (table) => [
    p.index("trainer_avail_slots_availability_idx").on(table.availabilityId),
  ]
);

export type OrganizationAvailabilityRow =
  typeof organizationAvailability.$inferSelect;
export type NewOrganizationAvailabilityRow =
  typeof organizationAvailability.$inferInsert;

export type TrainerAvailabilityRow = typeof trainerAvailability.$inferSelect;
export type NewTrainerAvailabilityRow = typeof trainerAvailability.$inferInsert;

export type OrganizationAvailabilitySlotRow =
  typeof organizationAvailabilitySlots.$inferSelect;
export type NewOrganizationAvailabilitySlotRow =
  typeof organizationAvailabilitySlots.$inferInsert;

export type TrainerAvailabilitySlotRow =
  typeof trainerAvailabilitySlots.$inferSelect;
export type NewTrainerAvailabilitySlotRow =
  typeof trainerAvailabilitySlots.$inferInsert;
