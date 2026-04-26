import * as p from "drizzle-orm/pg-core";

import { feedPosts, members } from "@/database/schema";

/**
 * FEED COMMENTS
 * A comment on a feed post
 */
export const feedComments = p.pgTable(
  "feed_comments",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    postId: p
      .uuid("post_id")
      .notNull()
      .references(() => feedPosts.id, { onDelete: "cascade" }),
    memberId: p
      .uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    parentCommentId: p
      .uuid("parent_comment_id")
      .references((): p.AnyPgColumn => feedComments.id, {
        onDelete: "cascade",
      }),
    text: p.text("text").notNull(),

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
    p.index("feed_comments_post_idx").on(table.postId),
    p.index("feed_comments_memberId_idx").on(table.memberId),
    p.index("feed_comments_parent_idx").on(table.parentCommentId),
  ]
);

export type FeedCommentRow = typeof feedComments.$inferSelect;
export type NewFeedCommentRow = typeof feedComments.$inferInsert;
