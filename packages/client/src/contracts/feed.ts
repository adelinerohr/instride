import { BoardSummary } from "./boards";
import { MemberSummary } from "./organizations";

// ============================================================================
// Entities
// ============================================================================

export interface FeedPost {
  id: string;
  organizationId: string;
  authorMemberId: string;
  boardId: string | null;
  text: string;
  mediaUrls: string[] | null;
  deletedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: MemberSummary;
  board: BoardSummary | null;
  comments: FeedComment[];
  likes: FeedLike[];
}

export interface FeedComment {
  id: string;
  postId: string;
  memberId: string;
  parentCommentId: string | null;
  text: string;
  deletedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  member: MemberSummary;
  replies: FeedComment[];
}

export interface FeedLike {
  id: string;
  postId: string;
  memberId: string;
  createdAt: Date | string;
  member: MemberSummary;
}

// ============================================================================
// Requests + responses
// ============================================================================

export interface ListFeedRequest {
  searchQuery?: string;
  boardId?: string;
  authorMemberId?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

export interface CreatePostRequest {
  text: string;
  boardId?: string | null;
  mediaUrls?: string[] | null;
}

export interface UpdatePostRequest extends CreatePostRequest {
  postId: string;
}

export interface CreateCommentRequest {
  text: string;
  postId: string;
  parentCommentId?: string | null;
}

export interface UpdateCommentRequest {
  commentId: string;
  text: string;
}

export interface LikePostRequest {
  postId: string;
}

export interface ListFeedResponse {
  posts: FeedPost[];
  nextCursor: { createdAt: string; id: string } | null;
  hasMore: boolean;
}

export interface GetFeedPostResponse {
  post: FeedPost;
}

export interface GetFeedCommentResponse {
  comment: FeedComment;
}

export interface GetFeedLikeResponse {
  like: FeedLike;
}
