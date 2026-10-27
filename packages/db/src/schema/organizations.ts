import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

import { InvitationKind, InvitationStatus, MembershipRole } from "../enums";
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
 * A person at a barn.
 *
 * `userId` is null for dependents who don't have their own login (a guardian
 * created them). Those members carry their own `name` / `dateOfBirth`; members
 * with a login get those from `users`. When a dependent later gets a login
 * (a `dependent_account` invitation), `userId` is filled in on this same row,
 * so their lessons, history and guardians stay attached.
 *
 * `roles` can be empty: a parent who doesn't ride is just a member who has
 * dependents.
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
      .references(() => users.id, { onDelete: "cascade" }),
    roles: membershipRoleEnum("roles").array().notNull().default([]),

    /** Only for members without a login. */
    name: p.text("name"),
    dateOfBirth: p.date("date_of_birth"),

    kioskPin: p.text("kiosk_pin"),
    onboardingComplete: p
      .boolean("onboarding_complete")
      .notNull()
      .default(false),
    deletedAt: p.timestamp("deleted_at"),

    ...timestamps,
  },
  (t) => [
    // NULL user ids are distinct, so any number of login-less dependents is fine
    p.uniqueIndex("members_org_user_idx").on(t.organizationId, t.userId),
    p.index("members_user_id_idx").on(t.userId),
    p.check(
      "members_identity_check",
      sql`${t.userId} IS NOT NULL OR ${t.name} IS NOT NULL`
    ),
  ]
);

export const invitationStatusEnum = p.pgEnum(
  "invitation_status",
  InvitationStatus
);

export const invitationKindEnum = p.pgEnum("invitation_kind", InvitationKind);

/**
 * Every invite link, whatever it does (see InvitationKind).
 * - member:            `roles` set, `dependentMemberId` null
 * - guardian_link:     `dependentMemberId` set; acceptor becomes their guardian
 * - dependent_account: `dependentMemberId` set; acceptor's login is attached to that member
 */
export const invitations = p.pgTable(
  "invitations",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    kind: invitationKindEnum("kind").notNull().default(InvitationKind.MEMBER),
    email: p.text("email").notNull(),
    roles: membershipRoleEnum("roles").array().notNull().default([]),
    dependentMemberId: p
      .uuid("dependent_member_id")
      .references(() => members.id, { onDelete: "cascade" }),
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
    p.check(
      "invitations_dependent_check",
      sql`(${t.kind} = 'member') = (${t.dependentMemberId} IS NULL)`
    ),
  ]
);
