import * as p from "drizzle-orm/pg-core";

import { boards, organizations, members } from "@/database/schema";

/**
 * FEED POSTS
 * A post in the feed
 */
export const feedPosts = p.pgTable(
  "feed_posts",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    authorMemberId: p
      .uuid("author_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    boardId: p
      .uuid("board_id")
      .references(() => boards.id, { onDelete: "set null" }),
    text: p.text("text").notNull(),
    mediaUrls: p.text("media_urls").array(),

    // soft delete
    deletedAt: p.timestamp("deleted_at", { withTimezone: true }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("feed_posts_organizationId_idx").on(table.organizationId),
    p.index("feed_posts_authorMemberId_idx").on(table.authorMemberId),
    p.index("feed_posts_board_idx").on(table.boardId),
    p
      .index("feed_posts_organizationId_boardId_idx")
      .on(table.organizationId, table.boardId),
    p
      .index("feed_posts_organizationId_authorMemberId_idx")
      .on(table.organizationId, table.authorMemberId),
  ]
);

export type FeedPostRow = typeof feedPosts.$inferSelect;
export type NewFeedPostRow = typeof feedPosts.$inferInsert;
