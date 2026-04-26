import { and, eq, isNull } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import {
  feedCommentExpansion,
  feedLikeExpansion,
  feedPostExpansion,
} from "./fragments";
import {
  feedComments,
  feedLikes,
  feedPosts,
  type NewFeedCommentRow,
  type NewFeedLikeRow,
  type NewFeedPostRow,
  type FeedCommentRow,
  type FeedPostRow,
} from "./schema";

interface ListFeedFilters {
  organizationId: string;
  searchQuery?: string;
  boardId?: string;
  authorMemberId?: string;
  cursor?: { createdAt: Date; id: string };
  limit: number; // already-clamped, includes the +1 lookahead
}

export const createFeedService = (client: Database | Transaction = db) => ({
  // ============================================================================
  // Posts
  // ============================================================================

  createPost: async (data: NewFeedPostRow) => {
    const [post] = await client.insert(feedPosts).values(data).returning();
    assertExists(post, "Failed to create post");
    return post;
  },

  findOnePost: async (id: string, organizationId: string) => {
    const post = await client.query.feedPosts.findFirst({
      where: { id, organizationId, deletedAt: { isNull: true } },
      with: feedPostExpansion,
    });
    assertExists(post, "Post not found");
    return post;
  },

  findOnePostScalar: async (id: string, organizationId: string) => {
    const post = await client.query.feedPosts.findFirst({
      where: { id, organizationId },
    });
    assertExists(post, "Post not found");
    return post;
  },

  listPosts: async (filters: ListFeedFilters) => {
    return await client.query.feedPosts.findMany({
      where: {
        organizationId: filters.organizationId,
        deletedAt: { isNull: true },
        ...(filters.boardId && { boardId: filters.boardId }),
        ...(filters.authorMemberId && {
          authorMemberId: filters.authorMemberId,
        }),
        ...(filters.searchQuery && {
          text: { ilike: `%${filters.searchQuery.trim()}%` },
        }),
        ...(filters.cursor && {
          OR: [
            { createdAt: { lt: filters.cursor.createdAt } },
            {
              AND: [
                { createdAt: { eq: filters.cursor.createdAt } },
                { id: { lt: filters.cursor.id } },
              ],
            },
          ],
        }),
      },
      orderBy: { createdAt: "desc", id: "desc" },
      limit: filters.limit,
      with: feedPostExpansion,
    });
  },

  updatePost: async (
    id: string,
    organizationId: string,
    data: Partial<FeedPostRow>
  ) => {
    const [post] = await client
      .update(feedPosts)
      .set(data)
      .where(
        and(eq(feedPosts.id, id), eq(feedPosts.organizationId, organizationId))
      )
      .returning();
    assertExists(post, "Post not found");
    return post;
  },

  softDeletePost: async (id: string, organizationId: string) => {
    const now = new Date();
    await client.transaction(async (tx) => {
      // Hard-delete all likes (no soft-delete column on likes)
      await tx.delete(feedLikes).where(eq(feedLikes.postId, id));

      // Soft-delete all non-deleted comments
      await tx
        .update(feedComments)
        .set({ deletedAt: now })
        .where(
          and(eq(feedComments.postId, id), isNull(feedComments.deletedAt))
        );

      // Soft-delete the post
      await tx
        .update(feedPosts)
        .set({ deletedAt: now })
        .where(
          and(
            eq(feedPosts.id, id),
            eq(feedPosts.organizationId, organizationId)
          )
        );
    });
  },

  // ============================================================================
  // Comments
  // ============================================================================

  createComment: async (data: NewFeedCommentRow) => {
    const [comment] = await client
      .insert(feedComments)
      .values(data)
      .returning();
    assertExists(comment, "Failed to create comment");
    return comment;
  },

  findOneComment: async (id: string) => {
    const comment = await client.query.feedComments.findFirst({
      where: { id },
      with: feedCommentExpansion,
    });
    assertExists(comment, "Comment not found");
    return comment;
  },

  findOneCommentScalar: async (id: string) => {
    const comment = await client.query.feedComments.findFirst({
      where: { id },
    });
    assertExists(comment, "Comment not found");
    return comment;
  },

  updateComment: async (id: string, data: Partial<FeedCommentRow>) => {
    const [comment] = await client
      .update(feedComments)
      .set(data)
      .where(eq(feedComments.id, id))
      .returning();
    assertExists(comment, "Comment not found");
    return comment;
  },

  softDeleteComment: async (id: string) => {
    await client
      .update(feedComments)
      .set({ deletedAt: new Date() })
      .where(and(eq(feedComments.id, id), isNull(feedComments.deletedAt)));
  },

  // ============================================================================
  // Likes
  // ============================================================================

  createLike: async (data: NewFeedLikeRow) => {
    const [like] = await client.insert(feedLikes).values(data).returning();
    assertExists(like, "Failed to create like");
    return like;
  },

  findOneLike: async (id: string) => {
    const like = await client.query.feedLikes.findFirst({
      where: { id },
      with: feedLikeExpansion,
    });
    assertExists(like, "Like not found");
    return like;
  },

  deleteLike: async (id: string) => {
    await client.delete(feedLikes).where(eq(feedLikes.id, id));
  },
});

export const feedService = createFeedService();
