import { defineRelations } from "drizzle-orm";

import { accounts, sessions, users, verifications } from "./schema/auth";
import { invitations, members, organizations } from "./schema/organizations";
import { levels, riders, trainers } from "./schema/profiles";

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  organizations,
  members,
  invitations,
  levels,
  trainers,
  riders,
};

export const relations = defineRelations(schema, (r) => ({
  users: {
    memberships: r.many.members(),
  },
  organizations: {
    members: r.many.members(),
    levels: r.many.levels(),
  },
  members: {
    user: r.one.users({
      from: r.members.userId,
      to: r.users.id,
      optional: false,
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
  },
  invitations: {
    organization: r.one.organizations({
      from: r.invitations.organizationId,
      to: r.organizations.id,
      optional: false,
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
