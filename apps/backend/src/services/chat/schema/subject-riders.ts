import * as p from "drizzle-orm/pg-core";

import { riders } from "@/database/schema";

import { conversations } from "./conversations";

// ----------------------------------------------------------------------------
// Subject riders — the rider(s) the conversation is "about"
// ----------------------------------------------------------------------------
//
// Using a join table from day one (instead of a `subjectRiderId` column on
// `conversations`) so that group chats land as a pure code change, no
// schema migration. Direct chats always have exactly one row here; group
// chats can have many.

export const conversationSubjectRiders = p.pgTable(
  "conversation_subject_riders",
  {
    conversationId: p
      .uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    riderId: p
      .uuid("rider_id")
      .notNull()
      .references(() => riders.id, { onDelete: "cascade" }),
    addedAt: p
      .timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    p.primaryKey({ columns: [table.conversationId, table.riderId] }),
    p.index("conversation_subject_riders_rider_idx").on(table.riderId),
  ]
);

export type ConversationSubjectRiderRow =
  typeof conversationSubjectRiders.$inferSelect;
export type NewConversationSubjectRiderRow =
  typeof conversationSubjectRiders.$inferInsert;
