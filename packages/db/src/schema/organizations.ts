import * as p from "drizzle-orm/pg-core";

import { InvitationStatus, MembershipRole } from "../enums";
import { timestamps } from "./_columns";
import { users } from "./auth";

export const membershipRoleEnum = p.pgEnum("membership_role", MembershipRole);

export const organizations = p.pgTable("organizations", {
  id: p.uuid("id").primaryKey().defaultRandom(),
  name: p.text("name").notNull(),
  slug: p.text("slug").notNull().unique(),
  timezone: p.text("timezone").notNull().default("UTC"),

  // Branding
  logoUrl: p.text("logo_url"),
  logoKey: p.text("logo_key"),
  primaryColor: p.text("primary_color"),

  // Contact
  phone: p.text("phone"),
  website: p.text("website"),

  // Social
  facebook: p.text("facebook"),
  instagram: p.text("instagram"),
  youtube: p.text("youtube"),
  tiktok: p.text("tiktok"),

  // Address
  addressLine1: p.text("address_line_1"),
  addressLine2: p.text("address_line_2"),
  city: p.text("city"),
  state: p.text("state"),
  postalCode: p.text("postal_code"),

  // Settings
  allowSameDayBookings: p
    .boolean("allow_same_day_bookings")
    .notNull()
    .default(false),
  allowPublicJoin: p.boolean("allow_public_join").notNull().default(false),

  ...timestamps,
});

/**
 * One row per (organization, user). Placeholder members (e.g. a dependent a
 * guardian created before they have their own login) still need a user row;
 * `isPlaceholder` marks them.
 */
export const members = p.pgTable(
  "members",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: p
      .text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roles: membershipRoleEnum("roles")
      .array()
      .notNull()
      .default([MembershipRole.RIDER]),

    kioskPin: p.text("kiosk_pin"),
    onboardingComplete: p
      .boolean("onboarding_complete")
      .notNull()
      .default(false),
    isPlaceholder: p.boolean("is_placeholder").notNull().default(false),
    deletedAt: p.timestamp("deleted_at"),

    ...timestamps,
  },
  (t) => [
    p.uniqueIndex("members_org_user_idx").on(t.organizationId, t.userId),
    p.index("members_user_id_idx").on(t.userId),
  ]
);

export const invitationStatusEnum = p.pgEnum(
  "invitation_status",
  InvitationStatus
);

/**
 * Invite someone (by email) into an organization with one or more roles.
 * Accepting creates the member row. The token goes in the invite link.
 */
export const invitations = p.pgTable(
  "invitations",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: p.text("email").notNull(),
    roles: membershipRoleEnum("roles").array().notNull(),
    token: p.text("token").notNull().unique(),
    status: invitationStatusEnum("status")
      .notNull()
      .default(InvitationStatus.PENDING),
    invitedByUserId: p
      .text("invited_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: p.timestamp("expires_at").notNull(),
    acceptedAt: p.timestamp("accepted_at"),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    p.index("invitations_organization_id_idx").on(t.organizationId),
    p.index("invitations_email_idx").on(t.email),
  ]
);
