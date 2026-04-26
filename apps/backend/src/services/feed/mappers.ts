import type {
  BoardSummary,
  FeedComment,
  FeedLike,
  FeedPost,
} from "@instride/api/contracts";

import { AuthUserRow } from "@/services/auth/schema";
import { toMemberSummary } from "@/services/organizations/mappers";
import { MemberRow } from "@/services/organizations/schema";
import { assertExists } from "@/shared/utils/validation";

import type { FeedCommentRow, FeedLikeRow, FeedPostRow } from "./schema";

type MemberWithAuth = MemberRow & { authUser: AuthUserRow | null };

export function toFeedLike(
  row: FeedLikeRow & { member: MemberWithAuth | null }
): FeedLike {
  assertExists(row.member, "Like has no member");
  return {
    id: row.id,
    postId: row.postId,
    memberId: row.memberId,
    createdAt: row.createdAt,
    member: toMemberSummary(row.member),
  };
}

export function toFeedComment(
  row: FeedCommentRow & {
    member: MemberWithAuth | null;
    replies?: Array<FeedCommentRow & { member: MemberWithAuth | null }>;
  }
): FeedComment {
  assertExists(row.member, "Comment has no member");
  return {
    id: row.id,
    postId: row.postId,
    memberId: row.memberId,
    parentCommentId: row.parentCommentId,
    text: row.text,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    member: toMemberSummary(row.member),
    replies: (row.replies ?? []).map((reply) => toFeedComment(reply)),
  };
}

export function toFeedPost(
  row: FeedPostRow & {
    author: MemberWithAuth | null;
    board: BoardSummary | null;
    comments: Array<Parameters<typeof toFeedComment>[0]>;
    likes: Array<Parameters<typeof toFeedLike>[0]>;
  }
): FeedPost {
  assertExists(row.author, "Post has no author");
  return {
    id: row.id,
    organizationId: row.organizationId,
    authorMemberId: row.authorMemberId,
    boardId: row.boardId,
    text: row.text,
    mediaUrls: row.mediaUrls,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: toMemberSummary(row.author),
    board: row.board,
    comments: row.comments.map(toFeedComment),
    likes: row.likes.map(toFeedLike),
  };
}
