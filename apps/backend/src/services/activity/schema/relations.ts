import { defineRelationsPart } from "drizzle-orm/relations";

import * as schema from "@/database/schema";

export const activityRelations = defineRelationsPart(schema, (r) => ({
  activity: {
    actorMember: r.one.members({
      from: r.activity.actorMemberId,
      to: r.members.id,
    }),
    ownerMember: r.one.members({
      from: r.activity.ownerMemberId,
      to: r.members.id,
    }),
  },
}));
