import { ConversationParticipantRole } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { members, messages } from "@/database/schema";

import { conversations } from "./conversations";

export const conversationParticipantRoleEnum = p.pgEnum(
  "conversation_participant_role",
  ConversationParticipantRole
);

export const conversationParticipants = p.pgTable(
  "conversation_participants",
  {
    conversationId: p
      .uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    memberId: p
      .uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),

    role: conversationParticipantRoleEnum("role").notNull(),

    joinedAt: p
      .timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Read receipts: pointer to the most recent message this member has read
    // FK is set to null on message delete, so soft-delete of messages doesn't
    // cascade-corrupt the read state.
    lastReadMessageId: p
      .uuid("last_read_message_id")
      .references((): p.AnyPgColumn => messages.id, { onDelete: "set null" }),

    mutedAt: p.timestamp("muted_at", { withTimezone: true }),

    // Soft-leave: keeps history but excludes from future delivery
    leftAt: p.timestamp("left_at", { withTimezone: true }),
  },
  (table) => [
    p.primaryKey({ columns: [table.conversationId, table.memberId] }),
    p.index("conversation_participants_member_idx").on(table.memberId),
  ]
);

export type ConversationParticipantRow =
  typeof conversationParticipants.$inferSelect;
export type NewConversationParticipantRow =
  typeof conversationParticipants.$inferInsert;
