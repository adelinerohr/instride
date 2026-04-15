import { defineRelationsPart } from "drizzle-orm/relations";

import * as schema from "@/database/schema";

export const kioskRelations = defineRelationsPart(schema, (r) => ({
  kioskSessions: {
    organization: r.one.organizations({
      from: r.kioskSessions.organizationId,
      to: r.organizations.id,
    }),
    actingMember: r.one.members({
      from: r.kioskSessions.actingMemberId,
      to: r.members.id,
    }),
    board: r.one.boards({
      from: r.kioskSessions.boardId,
      to: r.boards.id,
    }),
  },
}));
