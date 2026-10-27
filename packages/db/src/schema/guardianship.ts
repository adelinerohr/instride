import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

import { DependentAction, PendingActionStatus } from "../enums";
import {
  defaultGuardianPermissions,
  type GuardianPermissions,
} from "../guardian-permissions";
import { timestamps } from "./_columns";
import { members, organizations } from "./organizations";

/**
 * A guardian is responsible for a dependent within one organization.
 *
 * Active means `revokedAt IS NULL`. Revoking keeps the row for history; a new
 * link creates a new row. This table is the ONLY source of truth for
 * guardianship: "is a guardian" = has an active row as guardian, "is a
 * dependent / restricted" = has an active row as dependent.
 *
 * Links only connect people. What the dependent may do lives in
 * dependent_controls, one row per dependent, so two guardians can never
 * disagree about the rules.
 */
export const guardianRelationships = p.pgTable(
  "guardian_relationships",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    guardianMemberId: p
      .uuid("guardian_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    dependentMemberId: p
      .uuid("dependent_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),

    revokedAt: p.timestamp("revoked_at"),
    revokedByMemberId: p
      .uuid("revoked_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),

    ...timestamps,
  },
  (t) => [
    // One ACTIVE link per pair; revoked rows don't count
    p
      .uniqueIndex("guardian_rel_active_pair_idx")
      .on(t.guardianMemberId, t.dependentMemberId)
      .where(sql`${t.revokedAt} IS NULL`),
    p.index("guardian_rel_guardian_idx").on(t.guardianMemberId),
    p.index("guardian_rel_dependent_idx").on(t.dependentMemberId),
    p.index("guardian_rel_organization_idx").on(t.organizationId),
    p.check(
      "guardian_rel_not_self",
      sql`${t.guardianMemberId} <> ${t.dependentMemberId}`
    ),
  ]
);

/**
 * Settings for one dependent, shared by all of their guardians.
 * Created the first time someone becomes their guardian.
 */
export const dependentControls = p.pgTable("dependent_controls", {
  memberId: p
    .uuid("member_id")
    .primaryKey()
    .references(() => members.id, { onDelete: "cascade" }),
  organizationId: p
    .uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  /** Read with parseGuardianPermissions() so missing keys get defaults. */
  permissions: p
    .jsonb("permissions")
    .$type<GuardianPermissions>()
    .notNull()
    .default(defaultGuardianPermissions),

  /** Parental consent for a minor's account and data (COPPA). */
  consentGivenAt: p.timestamp("consent_given_at"),
  consentGivenByMemberId: p
    .uuid("consent_given_by_member_id")
    .references(() => members.id, { onDelete: "set null" }),

  updatedByMemberId: p
    .uuid("updated_by_member_id")
    .references(() => members.id, { onDelete: "set null" }),
  ...timestamps,
});

export const dependentActionEnum = p.pgEnum(
  "dependent_action",
  DependentAction
);
export const pendingActionStatusEnum = p.pgEnum(
  "pending_action_status",
  PendingActionStatus
);

/**
 * Something a dependent asked to do that needs a guardian's OK first
 * (permissions.bookings.requiresApproval). `payload` is the original request
 * input; approving replays it through the same procedure with the guardian as
 * the actor. Procedures for this land with the lessons router.
 */
export const pendingActions = p.pgTable(
  "pending_actions",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    dependentMemberId: p
      .uuid("dependent_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    action: dependentActionEnum("action").notNull(),
    payload: p.jsonb("payload").notNull(),
    status: pendingActionStatusEnum("status")
      .notNull()
      .default(PendingActionStatus.PENDING),
    decidedByMemberId: p
      .uuid("decided_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),
    decidedAt: p.timestamp("decided_at"),
    ...timestamps,
  },
  (t) => [
    p
      .index("pending_actions_dependent_status_idx")
      .on(t.dependentMemberId, t.status),
  ]
);
