import { Board } from "./boards";
import { MemberWithUser } from "./users";

export interface BaseFeedPost extends Omit<
  FeedPost,
  "author" | "likes" | "comments" | "board"
> {}

export interface BaseFeedComment extends Omit<FeedComment, "member"> {}

export interface FeedPost {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  deletedAt: Date | string | null;
  authorMemberId: string;
  boardId: string | null;
  text: string;
  mediaUrls: string[] | null;
  author: MemberWithUser;
  likes: FeedLike[];
  comments: FeedComment[];
  board: Board | null;
}

export interface FeedLike {
  id: string;
  createdAt: Date | string;
  memberId: string;
  postId: string;
  member: MemberWithUser;
}

export interface FeedComment {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  memberId: string;
  text: string;
  postId: string;
  parentCommentId: string | null;
  member: MemberWithUser;
}

export interface FeedFilters {
  boardId?: string;
  authorMemberId?: string;
  searchQuery?: string;
}
