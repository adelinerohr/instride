import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const authRelations = defineRelationsPart(schema, (r) => ({
  authUsers: {
    authSessions: r.many.authSessions(),
    authAccounts: r.many.authAccounts(),
    authMembers: r.many.authMembers({
      from: r.authUsers.id,
      to: r.authMembers.userId,
    }),
    authInvitations: r.many.authInvitations({
      from: r.authUsers.id,
      to: r.authInvitations.inviterId,
    }),
    members: r.many.members({
      from: r.authUsers.id,
      to: r.members.userId,
    }),
  },
  authSessions: {
    user: r.one.authUsers({
      from: r.authSessions.userId,
      to: r.authUsers.id,
    }),
  },
  authAccounts: {
    user: r.one.authUsers({
      from: r.authAccounts.userId,
      to: r.authUsers.id,
    }),
  },
}));
