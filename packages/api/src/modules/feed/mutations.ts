import type { CreateCommentRequest, CreatePostRequest } from "@instride/shared";
import { useQueryClient } from "@tanstack/react-query";

import { getOrganizationId } from "#_internal";
import type {
  MutationHookOptions,
  OrganizationMutationHookOptions,
} from "#_internal/types";
import { mutation } from "#_internal/wrappers";
import { apiClient } from "#client";

import { feedKeys } from "./keys";

// ---- Standalone functions -----------------------------------------------------

export const feedMutations = {
  createPost: async ({
    organizationId,
    request,
  }: {
    organizationId: string;
    request: CreatePostRequest;
  }) => {
    const { post } = await apiClient.feed.createPost(organizationId, {
      request,
    });
    return post;
  },

  likePost: async (postId: string) => {
    await apiClient.feed.likePost(postId);
    return postId;
  },

  unlikePost: async (postId: string) => {
    await apiClient.feed.unlikePost(postId);
    return postId;
  },

  createComment: async ({
    postId,
    request,
  }: {
    postId: string;
    request: CreateCommentRequest;
  }) => {
    const { comment } = await apiClient.feed.createComment(postId, { request });
    return comment;
  },
};

// ---- Mutation hooks -----------------------------------------------------------

export function useCreatePost({
  mutationConfig,
}: OrganizationMutationHookOptions<typeof feedMutations.createPost> = {}) {
  const queryClient = useQueryClient();
  const organizationId = getOrganizationId();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.organization(feedMutations.createPost, {
    ...config,
    onSuccess: (post, ...args) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys(organizationId).posts(),
      });
      onSuccess?.(post, ...args);
    },
  });
}

export function useLikePost({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.likePost> = {}) {
  const organizationId = getOrganizationId();
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.base(feedMutations.likePost, {
    ...config,
    onSuccess: (postId, ...args) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys(organizationId).postById(postId),
      });
      onSuccess?.(postId, ...args);
    },
  });
}

export function useUnlikePost({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.unlikePost> = {}) {
  const organizationId = getOrganizationId();
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.base(feedMutations.unlikePost, {
    ...config,
    onSuccess: (postId, ...args) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys(organizationId).postById(postId),
      });
      onSuccess?.(postId, ...args);
    },
  });
}

export function useCreateComment({
  mutationConfig,
}: MutationHookOptions<typeof feedMutations.createComment> = {}) {
  const organizationId = getOrganizationId();
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return mutation.base(feedMutations.createComment, {
    ...config,
    onSuccess: (comment, ...args) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys(organizationId).postById(comment.postId),
      });
      onSuccess?.(comment, ...args);
    },
  });
}
