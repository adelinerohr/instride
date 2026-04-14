import * as p from "drizzle-orm/pg-core";

import { members, organizations, riders, trainers } from "@/database/schema";

import {
  ActivityMetadata,
  ActivitySubjectType,
  ActivityType,
} from "../types/models";

export const activityTypeEnum = p.pgEnum("activity_type", ActivityType);
export const activitySubjectTypeEnum = p.pgEnum(
  "activity_subject_type",
  ActivitySubjectType
);

export const activity = p.pgTable(
  "activity",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Who did it (always member level, can be null for system events)
    actorMemberId: p.uuid("actor_member_id").references(() => members.id, {
      onDelete: "set null",
    }),

    // Who's feed we're showing this activity for
    ownerMemberId: p
      .uuid("owner_member_id")
      .notNull()
      .references(() => members.id, {
        onDelete: "cascade",
      }),
    // Optional: If the activity is about a trainer
    trainerId: p.uuid("trainer_id").references(() => trainers.id, {
      onDelete: "set null",
    }),
    // Optional: If the activity is about a rider
    riderId: p.uuid("rider_id").references(() => riders.id, {
      onDelete: "set null",
    }),

    // What it's about (lesson, post, payment, rider, trainer, other)
    subjectType: activitySubjectTypeEnum("subject_type").notNull(),
    subjectId: p.uuid("subject_id").notNull(),

    type: activityTypeEnum("type").notNull(),

    // Flexible data for rendering (lesson title, post content, etc.)
    metadata: p.jsonb("metadata").$type<ActivityMetadata>().notNull(),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    p.index("activity_actorMemberId_idx").on(table.actorMemberId),
    p.index("activity_organizationId_idx").on(table.organizationId),
  ]
);

export type Activity = typeof activity.$inferSelect;
