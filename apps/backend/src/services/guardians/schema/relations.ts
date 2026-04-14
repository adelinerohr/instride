import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const guardiansRelations = defineRelationsPart(schema, (r) => ({
  guardianRelationships: {
    organization: r.one.organizations({
      from: r.guardianRelationships.organizationId,
      to: r.organizations.id,
    }),
    guardian: r.one.members({
      from: r.guardianRelationships.guardianMemberId,
      to: r.members.id,
    }),
    dependent: r.one.members({
      from: r.guardianRelationships.dependentMemberId,
      to: r.members.id,
    }),
    invitations: r.many.guardianInvitations({
      from: r.guardianRelationships.id,
      to: r.guardianInvitations.relationshipId,
    }),
  },

  guardianInvitations: {
    relationship: r.one.guardianRelationships({
      from: r.guardianInvitations.relationshipId,
      to: r.guardianRelationships.id,
    }),
  },
}));
