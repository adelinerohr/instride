const memberWithAuth = {
  with: { authUser: true },
} as const;

const commentWithMemberAndReplies = {
  with: {
    member: memberWithAuth,
    replies: {
      with: { member: memberWithAuth },
    },
  },
} as const;

export const feedPostExpansion = {
  author: memberWithAuth,
  board: true,
  comments: commentWithMemberAndReplies,
  likes: {
    with: { member: memberWithAuth },
  },
} as const;

export const feedCommentExpansion = {
  member: memberWithAuth,
  replies: { with: { member: memberWithAuth } },
} as const;

export const feedLikeExpansion = {
  member: memberWithAuth,
} as const;
