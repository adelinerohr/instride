import { Board } from "@/services/boards/types/models";
import { Member } from "@/services/organizations/types/models";

export interface FeedPost {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  deletedAt: Date | string | null;
  boardId: string | null;
  authorMemberId: string;
  text: string | null;
  mediaUrls: string[] | null;
  comments?: FeedComment[] | null;
  likes?: FeedLike[] | null;
  author?: Member | null;
  board?: Board | null;
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
  member?: Member | null;
  replies?: FeedComment[] | null;
}

export interface FeedLike {
  id: string;
  createdAt: Date | string;
  memberId: string;
  postId: string;
  member?: Member | null;
}
