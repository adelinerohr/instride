import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    memberships: r.many.members(),
  },
  organizations: {
    members: r.many.members(),
    levels: r.many.levels(),
  },
  members: {
    /** Null for dependents without their own login. */
    user: r.one.users({
      from: r.members.userId,
      to: r.users.id,
    }),
    organization: r.one.organizations({
      from: r.members.organizationId,
      to: r.organizations.id,
      optional: false,
    }),
    trainer: r.one.trainers({
      from: r.members.id,
      to: r.trainers.memberId,
    }),
    rider: r.one.riders({
      from: r.members.id,
      to: r.riders.memberId,
    }),
    /** Present once the member has ever had a guardian. */
    controls: r.one.dependentControls({
      from: r.members.id,
      to: r.dependentControls.memberId,
    }),
    /** Active links where this member is the guardian. */
    dependentLinks: r.many.guardianRelationships({
      from: r.members.id,
      to: r.guardianRelationships.guardianMemberId,
      where: { revokedAt: { isNull: true } },
      alias: "guardian",
    }),
    /** Active links where this member is the dependent. */
    guardianLinks: r.many.guardianRelationships({
      from: r.members.id,
      to: r.guardianRelationships.dependentMemberId,
      where: { revokedAt: { isNull: true } },
      alias: "dependent",
    }),
  },
  guardianRelationships: {
    guardian: r.one.members({
      from: r.guardianRelationships.guardianMemberId,
      to: r.members.id,
      optional: false,
      alias: "guardian",
    }),
    dependent: r.one.members({
      from: r.guardianRelationships.dependentMemberId,
      to: r.members.id,
      optional: false,
      alias: "dependent",
    }),
  },
  invitations: {
    organization: r.one.organizations({
      from: r.invitations.organizationId,
      to: r.organizations.id,
      optional: false,
    }),
    dependent: r.one.members({
      from: r.invitations.dependentMemberId,
      to: r.members.id,
    }),
  },
  levels: {
    organization: r.one.organizations({
      from: r.levels.organizationId,
      to: r.organizations.id,
      optional: false,
    }),
  },
  riders: {
    level: r.one.levels({
      from: r.riders.ridingLevelId,
      to: r.levels.id,
    }),
  },
}));
