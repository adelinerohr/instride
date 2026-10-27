import * as p from "drizzle-orm/pg-core";

import { timestamps } from "./_columns";
import { members, organizations } from "./organizations";

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
    ...timestamps,
  },
  (t) => [p.index("levels_organization_id_idx").on(t.organizationId)]
);

/** Created when a member has the "trainer" role. */
export const trainers = p.pgTable(
  "trainers",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    memberId: p
      .uuid("member_id")
      .notNull()
      .unique()
      .references(() => members.id, { onDelete: "cascade" }),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    bio: p.text("bio"),
    allowSameDayBookings: p
      .boolean("allow_same_day_bookings")
      .notNull()
      .default(false),
    deletedAt: p.timestamp("deleted_at"),
    ...timestamps,
  },
  (t) => [p.index("trainers_organization_id_idx").on(t.organizationId)]
);

/** Created when a member has the "rider" role. */
export const riders = p.pgTable(
  "riders",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    memberId: p
      .uuid("member_id")
      .notNull()
      .unique()
      .references(() => members.id, { onDelete: "cascade" }),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    emergencyContactName: p.text("emergency_contact_name"),
    emergencyContactPhone: p.text("emergency_contact_phone"),
    ridingLevelId: p
      .uuid("riding_level_id")
      .references(() => levels.id, { onDelete: "set null" }),
    deletedAt: p.timestamp("deleted_at"),
    ...timestamps,
  },
  (t) => [p.index("riders_organization_id_idx").on(t.organizationId)]
);
