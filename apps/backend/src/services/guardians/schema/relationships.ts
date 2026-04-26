import { defaultPermissions } from "@instride/api/contracts";
import {
  GuardianPermissions,
  GuardianRelationshipStatus,
} from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { organizations, members } from "@/database/schema";

export const guardianRelationshipStatuses = p.pgEnum(
  "guardian_relationship_statuses",
  GuardianRelationshipStatus
);

/**
 * GUARDIAN RELATIONSHIPS
 * Links a guardian to a dependent within a facility
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

    status: guardianRelationshipStatuses("status")
      .notNull()
      .default(GuardianRelationshipStatus.PENDING),
    revokedAt: p.timestamp("revoked_at", { withTimezone: true }),

    // parental controls
    permissions: p
      .jsonb("permissions")
      .$type<GuardianPermissions>()
      .notNull()
      .default(defaultPermissions),

    // COPPA compliance
    coppaConsentGiven: p
      .boolean("coppa_consent_given")
      .notNull()
      .default(false),
    coppaConsentGivenAt: p.timestamp("coppa_consent_given_at", {
      withTimezone: true,
    }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("guardian_rel_organization_idx").on(table.organizationId),
    p
      .index("guardian_rel_guardian_organization_idx")
      .on(table.guardianMemberId, table.organizationId),
    p
      .index("guardian_rel_dependent_organization_idx")
      .on(table.dependentMemberId, table.organizationId),
    p
      .uniqueIndex("guardian_rel_unique_idx")
      .on(
        table.guardianMemberId,
        table.dependentMemberId,
        table.organizationId
      ),
  ]
);

export type GuardianRelationshipRow = typeof guardianRelationships.$inferSelect;
export type NewGuardianRelationshipRow =
  typeof guardianRelationships.$inferInsert;
