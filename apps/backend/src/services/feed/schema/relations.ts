import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const feedRelations = defineRelationsPart(schema, (r) => ({
  feedPosts: {
    organization: r.one.organizations({
      from: r.feedPosts.organizationId,
      to: r.organizations.id,
    }),
    author: r.one.members({
      from: r.feedPosts.authorMemberId,
      to: r.members.id,
    }),
    board: r.one.boards({
      from: r.feedPosts.boardId,
      to: r.boards.id,
    }),
    likes: r.many.feedLikes({
      from: r.feedPosts.id,
      to: r.feedLikes.postId,
    }),
    comments: r.many.feedComments({
      from: r.feedPosts.id,
      to: r.feedComments.postId,
    }),
  },

  feedLikes: {
    post: r.one.feedPosts({
      from: r.feedLikes.postId,
      to: r.feedPosts.id,
    }),
    member: r.one.members({
      from: r.feedLikes.memberId,
      to: r.members.id,
    }),
  },

  feedComments: {
    post: r.one.feedPosts({
      from: r.feedComments.postId,
      to: r.feedPosts.id,
    }),
    member: r.one.members({
      from: r.feedComments.memberId,
      to: r.members.id,
    }),
    parentComment: r.one.feedComments({
      from: r.feedComments.parentCommentId,
      to: r.feedComments.id,
    }),
    replies: r.many.feedComments({
      from: r.feedComments.id,
      to: r.feedComments.parentCommentId,
    }),
  },
}));
