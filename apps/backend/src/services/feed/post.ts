import { and, eq, isNull } from "drizzle-orm";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "./db";
import { feedComments, feedLikes, feedPosts } from "./schema";
import { postCreated } from "./topics";
import {
  GetFeedCommentResponse,
  GetFeedLikeResponse,
  GetFeedPostResponse,
} from "./types/contracts";

interface CreatePostRequest {
  text: string;
  boardId?: string | null;
  mediaUrls?: string[] | null;
}

export const createPost = api(
  {
    method: "POST",
    path: "/feed",
    expose: true,
    auth: true,
  },
  async (request: CreatePostRequest): Promise<GetFeedPostResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const { member } = await organizations.getMember();

    const [post] = await db
      .insert(feedPosts)
      .values({
        organizationId,
        authorMemberId: member.id,
        text: request.text,
        boardId: request.boardId,
        mediaUrls: request.mediaUrls,
      })
      .returning();

    await postCreated.publish({
      postId: post.id,
      organizationId,
      authorMemberId: member.id,
      content: request.text,
      createdAt: post.createdAt.toISOString(),
    });

    return { post };
  }
);

interface UpdatePostRequest extends CreatePostRequest {
  postId: string;
}

export const updatePost = api(
  {
    method: "PUT",
    path: "/feed/:postId",
    expose: true,
    auth: true,
  },
  async (request: UpdatePostRequest): Promise<GetFeedPostResponse> => {
    const [post] = await db
      .update(feedPosts)
      .set({ text: request.text, boardId: request.boardId })
      .where(eq(feedPosts.id, request.postId))
      .returning();

    return { post };
  }
);

export const deletePost = api(
  {
    method: "DELETE",
    path: "/feed/:postId",
    expose: true,
    auth: true,
  },
  async ({ postId }: { postId: string }): Promise<void> => {
    // 1. Delete all likes for the post
    await db.delete(feedLikes).where(eq(feedLikes.postId, postId));
    // 2. Delete all comments for the post
    await db
      .update(feedComments)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(feedComments.postId, postId), isNull(feedComments.deletedAt))
      );
    // 3. Delete the post
    await db
      .update(feedPosts)
      .set({ deletedAt: new Date() })
      .where(eq(feedPosts.id, postId));
  }
);

interface CreateCommentRequest {
  text: string;
  postId: string;
  parentCommentId?: string | null;
}

export const createComment = api(
  {
    method: "POST",
    path: "/feed/:postId/comments",
    expose: true,
    auth: true,
  },
  async (request: CreateCommentRequest): Promise<GetFeedCommentResponse> => {
    const { member } = await organizations.getMember();

    const [comment] = await db
      .insert(feedComments)
      .values({
        memberId: member.id,
        text: request.text,
        postId: request.postId,
        parentCommentId: request.parentCommentId ?? null,
      })
      .returning();

    return { comment };
  }
);

interface UpdateCommentRequest {
  commentId: string;
  text: string;
}

export const updateComment = api(
  {
    method: "PUT",
    path: "/feed/comments/:commentId",
    expose: true,
    auth: true,
  },
  async (request: UpdateCommentRequest): Promise<GetFeedCommentResponse> => {
    const [comment] = await db
      .update(feedComments)
      .set({ text: request.text })
      .where(eq(feedComments.id, request.commentId))
      .returning();

    return { comment };
  }
);

export const deleteComment = api(
  {
    method: "DELETE",
    path: "/feed/comments/:commentId",
    expose: true,
    auth: true,
  },
  async ({ commentId }: { commentId: string }): Promise<void> => {
    const comment = await db.query.feedComments.findFirst({
      where: {
        id: commentId,
        deletedAt: {
          isNull: true,
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.parentCommentId) {
      await db
        .update(feedComments)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(feedComments.id, comment.parentCommentId),
            isNull(feedComments.deletedAt)
          )
        );
    }

    await db
      .update(feedComments)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(feedComments.id, commentId), isNull(feedComments.deletedAt))
      );
  }
);

interface LikePostRequest {
  postId: string;
}

export const likePost = api(
  {
    method: "POST",
    path: "/feed/:postId/like",
    expose: true,
    auth: true,
  },
  async (request: LikePostRequest): Promise<GetFeedLikeResponse> => {
    const { member } = await organizations.getMember();

    const [like] = await db
      .insert(feedLikes)
      .values({
        memberId: member.id,
        postId: request.postId,
      })
      .returning();

    return { like };
  }
);

export const unlikePost = api(
  {
    method: "DELETE",
    path: "/feed/likes/:likeId",
    expose: true,
    auth: true,
  },
  async ({ likeId }: { likeId: string }): Promise<void> => {
    await db.delete(feedLikes).where(eq(feedLikes.id, likeId));
  }
);
