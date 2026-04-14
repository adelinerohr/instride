import * as p from "drizzle-orm/pg-core";

import { members, feedPosts } from "@/database/schema";

/**
 * FEED LIKES
 * A like on a feed post
 */
export const feedLikes = p.pgTable(
  "feed_likes",
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

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    p.index("feed_likes_post_idx").on(table.postId),
    p.index("feed_likes_memberId_idx").on(table.memberId),
    p.uniqueIndex("feed_likes_unique_idx").on(table.postId, table.memberId),
  ]
);

export type FeedLike = typeof feedLikes.$inferSelect;
export type NewFeedLike = typeof feedLikes.$inferInsert;
