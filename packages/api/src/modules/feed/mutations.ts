import {
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

import { useWrappedMutation } from "#_internal";
import type { MutationHookOptions } from "#_internal/types";
import { apiClient, feed, type types } from "#client";

import { feedKeys } from "./keys";

/** Detail query + infinite feed lists both use keys under `["feed","posts", …]`. */
function replaceFeedPostInCaches(
  queryClient: QueryClient,
  post: types.FeedPost
) {
  queryClient.setQueryData(feedKeys.postById(post.id), post);
  queryClient.setQueriesData<InfiniteData<feed.ListFeedResponse>>(
    { queryKey: feedKeys.postsLists() },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((p) => (p.id === post.id ? post : p)),
        })),
      }
  );
}

// ---- Standalone functions -----------------------------------------------------

export const feedMutations = {
  createPost: async (request: feed.CreatePostRequest) => {
    const { post } = await apiClient.feed.createPost(request);
    return post;
  },

  updatePost: async ({
    postId,
    request,
  }: {
    postId: string;
    request: feed.UpdatePostRequest;
  }) => {
    const { post } = await apiClient.feed.updatePost(postId, request);
    return post;
  },

  likePost: async (postId: string) => {
    const { like } = await apiClient.feed.likePost(postId);
    return like;
  },

  unlikePost: async ({
    likeId,
    postId,
  }: {
    likeId: string;
    postId: string;
  }) => {
    await apiClient.feed.unlikePost(likeId);
    return postId;
  },

  createComment: async ({
    postId,
    request,
  }: {
    postId: string;
    request: feed.CreateCommentRequest;
  }) => {
    const { comment } = await apiClient.feed.createComment(postId, request);
    return comment;
  },

  updateComment: async ({
    commentId,
    request,
  }: {
    commentId: string;
    request: feed.UpdateCommentRequest;
  }) => {
    const { comment } = await apiClient.feed.updateComment(commentId, request);
    return comment;
  },

  deletePost: async (postId: string) => {
    await apiClient.feed.deletePost(postId);
    return postId;
  },

  deleteComment: async (commentId: string) => {
    await apiClient.feed.deleteComment(commentId);
    return commentId;
  },
};

// ---- Mutation hooks -----------------------------------------------------------

export function useCreatePost({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.createPost> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.createPost, {
    ...config,
    onSuccess: (post, ...args) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys.postsRoot(),
      });
      onSuccess?.(post, ...args);
    },
  });
}

export function useUpdatePost({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.updatePost> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.updatePost, {
    ...config,
    onSuccess: (post, ...args) => {
      replaceFeedPostInCaches(queryClient, post);
      queryClient.invalidateQueries({ queryKey: feedKeys.postsRoot() });
      onSuccess?.(post, ...args);
    },
  });
}

export function useUpdateComment({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.updateComment> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.updateComment, {
    ...config,
    onSuccess: (comment, ...args) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys.postById(comment.postId),
      });
      queryClient.invalidateQueries({ queryKey: feedKeys.postsRoot() });
      onSuccess?.(comment, ...args);
    },
  });
}

export function useDeletePost({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.deletePost> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.deletePost, {
    ...config,
    onSuccess: (postId, ...args) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys.postsRoot(),
      });
      onSuccess?.(postId, ...args);
    },
  });
}

export function useDeleteComment({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.deleteComment> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.deleteComment, {
    ...config,
    onSuccess: (commentId, ...args) => {
      queryClient.setQueryData(
        feedKeys.postById(commentId),
        (old: types.FeedPost) => {
          return {
            ...old,
            comments: old.comments?.filter((c) => c.id !== commentId),
          };
        }
      );
      queryClient.invalidateQueries({
        queryKey: feedKeys.postById(commentId),
      });
      onSuccess?.(commentId, ...args);
    },
  });
}

export function useLikePost({
  userMemberId,
  user,
  mutationConfig,
}: {
  userMemberId: string;
  user: types.AuthUser;
} & MutationHookOptions<typeof feedMutations.likePost>) {
  const queryClient = useQueryClient();
  const { ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.likePost, {
    ...config,
    onMutate: async (postId) => {
      const updater = (post: types.FeedPost) => ({
        ...post,
        likes: [
          ...(post.likes || []),
          { memberId: userMemberId, liker: { authUser: user } },
        ],
      });
      queryClient.setQueriesData(
        { queryKey: feedKeys.postsRoot() },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if (
            "pages" in old &&
            Array.isArray((old as InfiniteData<feed.ListFeedResponse>).pages)
          ) {
            const data = old as InfiniteData<feed.ListFeedResponse>;
            return {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                posts: page.posts.map((p) =>
                  p.id === postId ? updater(p) : p
                ),
              })),
            };
          }
          const post = old as types.FeedPost;
          if ("id" in post && post.id === postId) return updater(post);
          return old;
        }
      );
    },
    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.postsRoot() });
    },
  });
}

export function useUnlikePost({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.unlikePost> = {}) {
  const queryClient = useQueryClient();
  const { ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.unlikePost, {
    ...config,
    onMutate: async ({ likeId, postId }) => {
      const updater = (post: types.FeedPost) => ({
        ...post,
        likes: post.likes?.filter((l) => l.id !== likeId) ?? [],
      });
      queryClient.setQueriesData(
        { queryKey: feedKeys.postsRoot() },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if (
            "pages" in old &&
            Array.isArray((old as InfiniteData<feed.ListFeedResponse>).pages)
          ) {
            const data = old as InfiniteData<feed.ListFeedResponse>;
            return {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                posts: page.posts.map((p) =>
                  p.id === postId ? updater(p) : p
                ),
              })),
            };
          }
          const post = old as types.FeedPost;
          if ("id" in post && post.id === postId) return updater(post);
          return old;
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.postsRoot() });
    },
  });
}

export function useCreateComment({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.createComment> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(feedMutations.createComment, {
    ...config,
    onSuccess: (comment, ...args) => {
      queryClient.setQueryData<types.FeedPost>(
        feedKeys.postById(comment.postId),
        (old) =>
          old ? { ...old, comments: [...(old.comments ?? []), comment] } : old
      );
      queryClient.invalidateQueries({
        queryKey: feedKeys.postById(comment.postId),
      });
      onSuccess?.(comment, ...args);
    },
  });
}
