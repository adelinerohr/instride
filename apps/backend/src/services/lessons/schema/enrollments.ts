import {
  LessonInstanceEnrollmentStatus,
  LessonSeriesEnrollmentStatus,
} from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import {
  organizations,
  lessonInstances,
  lessonSeries,
  members,
  riders,
} from "@/database/schema";

export const seriesEnrollmentStatusEnum = p.pgEnum(
  "series_enrollment_status",
  LessonSeriesEnrollmentStatus
);

export const instanceEnrollmentStatusEnum = p.pgEnum(
  "instance_enrollment_status",
  LessonInstanceEnrollmentStatus
);

/**
 * LESSON SERIES ENROLLMENTS
 * Rider's ongoing enrollment in a series — drives auto-enrollment
 */
export const lessonSeriesEnrollments = p.pgTable(
  "lesson_series_enrollments",
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
    riderId: p
      .uuid("rider_id")
      .notNull()
      .references(() => riders.id, { onDelete: "cascade" }),

    status: seriesEnrollmentStatusEnum("status").notNull().default("active"),

    // effective dates
    startDate: p.date("start_date").notNull(),
    endDate: p.date("end_date"),

    // audit
    enrolledByMemberId: p
      .uuid("enrolled_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    enrolledAt: p
      .timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: p.timestamp("ended_at", { withTimezone: true }),
    endedByMemberId: p
      .uuid("ended_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("lse_organizationId_idx").on(table.organizationId),
    p
      .index("lse_organizationId_rider_idx")
      .on(table.organizationId, table.riderId),
    p.index("lse_series_id_idx").on(table.seriesId),
    p.index("lse_series_status_idx").on(table.seriesId, table.status),
    p.index("lse_rider_idx").on(table.riderId),
    p
      .uniqueIndex("lse_series_rider_unique_idx")
      .on(table.seriesId, table.riderId),
  ]
);

/**
 * LESSON INSTANCE ENROLLMENTS
 * The actual booking — who shows up to a specific instance
 */
export const lessonInstanceEnrollments = p.pgTable(
  "lesson_instance_enrollments",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    instanceId: p
      .uuid("instance_id")
      .notNull()
      .references(() => lessonInstances.id, { onDelete: "cascade" }),
    riderId: p
      .uuid("rider_id")
      .notNull()
      .references(() => riders.id, { onDelete: "cascade" }),

    status: instanceEnrollmentStatusEnum("status")
      .notNull()
      .default("enrolled"),
    waitlistPosition: p.integer("waitlist_position"),

    // attendance
    attended: p.boolean("attended"),
    attendedAt: p.timestamp("attended_at", { withTimezone: true }),
    markedByMemberId: p
      .uuid("marked_by_member_profile_id")
      .references(() => members.id, { onDelete: "set null" }),

    // link back to series enrollment if auto-enrolled
    fromSeriesEnrollmentId: p
      .uuid("from_series_enrollment_id")
      .references(() => lessonSeriesEnrollments.id, { onDelete: "set null" }),

    // audit
    enrolledByMemberId: p
      .uuid("enrolled_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    enrolledAt: p
      .timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    unenrolledAt: p.timestamp("unenrolled_at", { withTimezone: true }),
    unenrolledByMemberId: p
      .uuid("unenrolled_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("lie_organizationId_idx").on(table.organizationId),
    p
      .index("lie_organizationId_rider_idx")
      .on(table.organizationId, table.riderId),
    p
      .index("lie_organizationId_status_idx")
      .on(table.organizationId, table.status),
    p.index("lie_instance_id_idx").on(table.instanceId),
    p.index("lie_instance_status_idx").on(table.instanceId, table.status),
    p.index("lie_rider_idx").on(table.riderId),
    p.index("lie_rider_status_idx").on(table.riderId, table.status),
    p.index("lie_series_enrollment_idx").on(table.fromSeriesEnrollmentId),
    p
      .uniqueIndex("lie_instance_rider_unique_idx")
      .on(table.instanceId, table.riderId),
  ]
);

export type LessonSeriesEnrollment =
  typeof lessonSeriesEnrollments.$inferSelect;
export type NewLessonSeriesEnrollment =
  typeof lessonSeriesEnrollments.$inferInsert;

export type LessonInstanceEnrollment =
  typeof lessonInstanceEnrollments.$inferSelect;
export type NewLessonInstanceEnrollment =
  typeof lessonInstanceEnrollments.$inferInsert;
