import type {
  CreateCommentRequest,
  CreatePostRequest,
  GetFeedCommentResponse,
  GetFeedLikeResponse,
  GetFeedPostResponse,
  LikePostRequest,
  UpdateCommentRequest,
  UpdatePostRequest,
} from "@instride/api/contracts";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { feedService } from "./feed.service";
import { toFeedComment, toFeedLike, toFeedPost } from "./mappers";
import { postCreated } from "./topics";

// ============================================================================
// Posts
// ============================================================================

export const createPost = api(
  { method: "POST", path: "/feed", expose: true, auth: true },
  async (request: CreatePostRequest): Promise<GetFeedPostResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const created = await feedService.createPost({
      organizationId,
      authorMemberId: member.id,
      text: request.text,
      boardId: request.boardId ?? null,
      mediaUrls: request.mediaUrls ?? null,
    });

    await postCreated.publish({
      postId: created.id,
      organizationId,
      authorMemberId: member.id,
      content: request.text,
      createdAt:
        created.createdAt instanceof Date
          ? created.createdAt.toISOString()
          : created.createdAt,
    });

    const full = await feedService.findOnePost(created.id, organizationId);
    return { post: toFeedPost(full) };
  }
);

export const updatePost = api(
  { method: "PUT", path: "/feed/:postId", expose: true, auth: true },
  async (request: UpdatePostRequest): Promise<GetFeedPostResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const existing = await feedService.findOnePostScalar(
      request.postId,
      organizationId
    );

    // Only the author can update their post
    if (existing.authorMemberId !== member.id) {
      throw APIError.permissionDenied("You can only update your own posts");
    }

    await feedService.updatePost(request.postId, organizationId, {
      text: request.text,
      boardId: request.boardId ?? null,
    });

    const full = await feedService.findOnePost(request.postId, organizationId);
    return { post: toFeedPost(full) };
  }
);

export const deletePost = api(
  { method: "DELETE", path: "/feed/:postId", expose: true, auth: true },
  async ({ postId }: { postId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const existing = await feedService.findOnePostScalar(
      postId,
      organizationId
    );

    // Author can delete; admin authorization for moderation lives elsewhere
    if (existing.authorMemberId !== member.id) {
      throw APIError.permissionDenied("You can only delete your own posts");
    }

    await feedService.softDeletePost(postId, organizationId);
  }
);

// ============================================================================
// Comments
// ============================================================================

export const createComment = api(
  { method: "POST", path: "/feed/:postId/comments", expose: true, auth: true },
  async (request: CreateCommentRequest): Promise<GetFeedCommentResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Verify the post exists in this org before commenting
    await feedService.findOnePost(request.postId, organizationId);

    const created = await feedService.createComment({
      postId: request.postId,
      memberId: member.id,
      text: request.text,
      parentCommentId: request.parentCommentId ?? null,
    });

    const full = await feedService.findOneComment(created.id);
    return { comment: toFeedComment(full) };
  }
);

export const updateComment = api(
  {
    method: "PUT",
    path: "/feed/comments/:commentId",
    expose: true,
    auth: true,
  },
  async (request: UpdateCommentRequest): Promise<GetFeedCommentResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const existing = await feedService.findOneCommentScalar(request.commentId);
    if (existing.memberId !== member.id) {
      throw APIError.permissionDenied("You can only update your own comments");
    }

    // Verify the parent post lives in this org (ownership chain)
    await feedService.findOnePostScalar(existing.postId, organizationId);

    await feedService.updateComment(request.commentId, { text: request.text });

    const full = await feedService.findOneComment(request.commentId);
    return { comment: toFeedComment(full) };
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
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const existing = await feedService.findOneCommentScalar(commentId);
    if (existing.deletedAt) {
      // Already deleted — idempotent no-op
      return;
    }

    if (existing.memberId !== member.id) {
      throw APIError.permissionDenied("You can only delete your own comments");
    }

    await feedService.findOnePostScalar(existing.postId, organizationId);
    await feedService.softDeleteComment(commentId);
  }
);

// ============================================================================
// Likes
// ============================================================================

export const likePost = api(
  { method: "POST", path: "/feed/:postId/like", expose: true, auth: true },
  async (request: LikePostRequest): Promise<GetFeedLikeResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    // Verify the post is in this org
    await feedService.findOnePost(request.postId, organizationId);

    const created = await feedService.createLike({
      postId: request.postId,
      memberId: member.id,
    });

    const full = await feedService.findOneLike(created.id);
    return { like: toFeedLike(full) };
  }
);

export const unlikePost = api(
  { method: "DELETE", path: "/feed/likes/:likeId", expose: true, auth: true },
  async ({ likeId }: { likeId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const like = await feedService.findOneLike(likeId);

    if (like.memberId !== member.id) {
      throw APIError.permissionDenied("You can only remove your own likes");
    }

    // Verify the post is in this org (defense in depth)
    await feedService.findOnePostScalar(like.postId, organizationId);

    await feedService.deleteLike(likeId);
  }
);
