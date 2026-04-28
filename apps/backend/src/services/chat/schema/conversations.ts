import { ConversationType } from "@instride/shared";
import * as p from "drizzle-orm/pg-core";

import { members, organizations } from "@/database/schema";
import { timeStamps } from "@/shared/utils/schema";

export const conversationTypeEnum = p.pgEnum(
  "conversation_type",
  ConversationType
);

export const conversations = p.pgTable(
  "conversations",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Discriminator - DIRECT today, GROUP later. Keeps v2 a code change only.
    type: conversationTypeEnum("type")
      .notNull()
      .default(ConversationType.DIRECT),

    // Optional title (used by group chats: ignored by direct chats)
    title: p.text("title"),

    createdBy: p
      .uuid("created_by")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),

    // Denormalized for fast inbox sorting: updated by the message service
    lastMessageAt: p.timestamp("last_message_at", { withTimezone: true }),

    deletedAt: p.timestamp("deleted_at", { withTimezone: true }),
    ...timeStamps,
  },
  (table) => [
    p
      .index("conversations_org_recency_idx")
      .on(table.organizationId, table.lastMessageAt.desc()),
    p.index("conversations_created_by_idx").on(table.createdBy),
  ]
);

export type ConversationRow = typeof conversations.$inferSelect;
export type NewConversationRow = typeof conversations.$inferInsert;
