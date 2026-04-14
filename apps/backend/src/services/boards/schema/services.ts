import * as p from "drizzle-orm/pg-core";

import { boards } from "@/services/boards/schema";
import {
  organizations,
  levels,
  trainers,
} from "@/services/organizations/schema";

/**
 * SERVICES
 * Lesson types/templates — defines pricing, duration, capacity
 */
export const services = p.pgTable(
  "services",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: p.text("name").notNull(),
    description: p.text("description"),

    // pricing
    price: p.integer("price").notNull(), // cents
    creditPrice: p.integer("credit_price").notNull(),
    creditAdditionalPrice: p.integer("credit_additional_price"),

    // configuration
    duration: p.integer("duration").notNull(), // minutes
    maxRiders: p.integer("max_riders").notNull(),
    isPrivate: p.boolean("is_private").notNull().default(false),
    canRecurBook: p.boolean("can_recur_book").notNull().default(false),
    isRestricted: p.boolean("is_restricted").notNull().default(false),
    restrictedToLevelId: p
      .uuid("restricted_to_level_id")
      .references(() => levels.id, { onDelete: "set null" }),
    isAllTrainers: p.boolean("is_all_trainers").notNull().default(true),
    canRiderAdd: p.boolean("can_rider_add").notNull().default(false),
    isActive: p.boolean("is_active").notNull().default(true),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("services_organizationId_idx").on(table.organizationId),
    p
      .index("services_organizationId_active_idx")
      .on(table.organizationId, table.isActive),
  ]
);

/**
 * SERVICE TRAINER ASSIGNMENTS
 * Which trainers can teach which services
 */
export const serviceTrainerAssignments = p.pgTable(
  "service_trainer_assignments",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    serviceId: p
      .uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    trainerId: p
      .uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "cascade" }),
    isActive: p.boolean("is_active").notNull().default(true),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("sta_service_id_idx").on(table.serviceId),
    p.index("sta_organizationId_idx").on(table.organizationId),
    p.index("sta_trainerId_idx").on(table.trainerId),
    p.index("sta_active_idx").on(table.isActive),
    p.uniqueIndex("sta_unique_idx").on(table.serviceId, table.trainerId),
  ]
);

/**
 * SERVICE BOARD ASSIGNMENTS
 * Which boards a service can be held on
 */
export const serviceBoardAssignments = p.pgTable(
  "service_board_assignments",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    serviceId: p
      .uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    boardId: p
      .uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    isActive: p.boolean("is_active").notNull().default(true),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    p.index("sba_service_id_idx").on(table.serviceId),
    p.index("sba_organizationId_idx").on(table.organizationId),
    p.index("sba_board_id_idx").on(table.boardId),
    p.uniqueIndex("sba_unique_idx").on(table.serviceId, table.boardId),
  ]
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type ServiceTrainerAssignment =
  typeof serviceTrainerAssignments.$inferSelect;
export type NewServiceTrainerAssignment =
  typeof serviceTrainerAssignments.$inferInsert;

export type ServiceBoardAssignment =
  typeof serviceBoardAssignments.$inferSelect;
export type NewServiceBoardAssignment =
  typeof serviceBoardAssignments.$inferInsert;
