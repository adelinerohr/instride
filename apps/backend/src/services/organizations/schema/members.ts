import { MembershipCapability, MembershipRole } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { authUsers } from "../../auth/schema/users";
import { authOrganizations } from "./auth-organizations";
import { levels } from "./levels";
import { organizations } from "./organizations";

export const membershipRoleEnum = p.pgEnum("membership_role", MembershipRole);
export const membershipCapabilityEnum = p.pgEnum(
  "membership_capability",
  MembershipCapability
);

/**
 * MEMBERS
 * Better Auth's members table
 */
export const authMembers = p.pgTable(
  "auth_members",
  {
    id: p.text("id").primaryKey(),
    userId: p
      .text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    organizationId: p
      .text("organization_id")
      .notNull()
      .references(() => authOrganizations.id, { onDelete: "cascade" }),
    role: p.text("role").default("member").notNull(),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    p.index("authMembers_organizationId_idx").on(table.organizationId),
    p.index("authMembers_userId_idx").on(table.userId),
  ]
);

/**
 * MEMBER PROFILES
 * Extension of Better Auth's members table
 * Shared table for all members of an organization
 */
export const members = p.pgTable(
  "members",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    userId: p
      .text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    authMemberId: p
      .text("auth_member_id")
      .notNull()
      .unique()
      .references(() => authMembers.id, { onDelete: "cascade" }),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id),

    // Membership access
    isPlaceholder: p.boolean("is_placeholder").default(false).notNull(),
    kioskPin: p.text("kiosk_pin"),
    roles: membershipRoleEnum("roles")
      .array()
      .notNull()
      .default([MembershipRole.RIDER]),

    onboardingComplete: p
      .boolean("onboarding_complete")
      .notNull()
      .default(false),

    deletedAt: p.timestamp("deleted_at"),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    p.index("members_userId_idx").on(table.userId),
    p.index("members_authMemberId_idx").on(table.authMemberId),
    p.index("members_organizationId_idx").on(table.organizationId),
  ]
);

/**
 * TRAINER PROFILES
 * Only if roles include trainer
 */
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
      .references(() => organizations.id),

    // Trainer information
    bio: p.text("bio"),

    // Trainer preferences
    allowSameDayBookings: p
      .boolean("allow_same_day_bookings")
      .notNull()
      .default(false),

    deletedAt: p.timestamp("deleted_at"),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    p.index("trainers_memberId_idx").on(table.memberId),
    p.index("trainers_organizationId_idx").on(table.organizationId),
  ]
);

/**
 * RIDER PROFILES
 * Only if roles include rider
 */
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
      .references(() => organizations.id),

    isRestricted: p.boolean("is_restricted").default(false).notNull(),

    // Emergency contact information
    emergencyContactName: p.text("emergency_contact_name"),
    emergencyContactPhone: p.text("emergency_contact_phone"),

    // Riding information
    ridingLevelId: p
      .uuid("riding_level_id")
      .references(() => levels.id, { onDelete: "set null" }),

    deletedAt: p.timestamp("deleted_at"),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    p.index("rider_profiles_memberId_idx").on(table.memberId),
    p.index("rider_profiles_organizationId_idx").on(table.organizationId),
  ]
);

export type AuthMemberRow = typeof authMembers.$inferSelect;
export type NewAuthMemberRow = typeof authMembers.$inferInsert;

export type MemberRow = typeof members.$inferSelect;
export type NewMemberRow = typeof members.$inferInsert;

export type TrainerRow = typeof trainers.$inferSelect;
export type NewTrainerRow = typeof trainers.$inferInsert;

export type RiderRow = typeof riders.$inferSelect;
export type NewRiderRow = typeof riders.$inferInsert;
