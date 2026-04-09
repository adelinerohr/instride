import { BaseFeedComment, BaseFeedPost, FeedPost } from "../interfaces";
import { FeedCursor } from "../models/types";

export interface GetFeedRequest {
  searchQuery?: string;
  boardId?: string;
  authorMemberId?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

export interface GetFeedResponse {
  posts: FeedPost[];
  nextCursor: FeedCursor | null;
  hasMore: boolean;
}

export interface GetFeedPostResponse {
  post: FeedPost;
}

export interface CreatePostRequest {
  authorMemberId: string;
  boardId?: string | null;
  text: string;
  mediaUrls?: string[] | null;
}

export interface CreatePostResponse {
  post: BaseFeedPost;
}

export interface ToggleLikeResponse {
  liked: boolean;
}

export interface CreateCommentRequest {
  text: string;
  memberId: string;
  parentCommentId?: string | null;
}

export interface CreateCommentResponse {
  comment: BaseFeedComment;
}
