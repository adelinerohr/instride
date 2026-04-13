import {
  useCreateComment,
  useLikePost,
  useUnlikePost,
  type types,
} from "@instride/api";
import { useRouteContext } from "@tanstack/react-router";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { PostComposer } from "../composer";
import { CommentItem, CommentInput } from "./comments";
import { PostHeader } from "./header";

type PostProps = {
  post: types.FeedPost;
};

export function Post({ post }: PostProps) {
  const { member } = useRouteContext({ strict: false });
  const [expandedComments, setExpandedComments] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  if (!member) return null;

  const likePost = useLikePost({
    userMemberId: member.id,
    user: member.authUser!,
  });
  const unlikePost = useUnlikePost();
  const createComment = useCreateComment();

  const isLiked = post.likes?.some((like) => like.memberId === member.id);
  const userLike = post.likes?.find((like) => like.memberId === member.id);
  const isUserPost = post.authorMemberId === member.id;

  const commentCount =
    (post.comments?.length ?? 0) +
    (post.comments
      ?.flatMap((comment) => comment.replies?.length ?? 0)
      .reduce((a, b) => a + b, 0) ?? 0);

  const handleToggleLike = () => {
    if (isLiked && userLike) {
      unlikePost.mutate({ likeId: userLike.id, postId: post.id });
    } else {
      likePost.mutate(post.id);
    }
  };

  const handleAddComment = (text: string) => {
    createComment.mutate({ postId: post.id, request: { text } });
  };

  return (
    <div className="w-full rounded-xl border bg-white">
      <div className="space-y-3 p-4">
        <PostHeader
          post={post}
          isUserPost={isUserPost}
          onEdit={() => setIsEditing(true)}
        />

        <div className="rounded-lg">
          {isEditing ? (
            <PostComposer post={post} onUpdate={() => setIsEditing(false)} />
          ) : (
            <p className="whitespace-pre-line text-sm">{post.text}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleToggleLike}
          >
            <HeartIcon
              className={cn(isLiked && "fill-destructive text-destructive")}
            />
          </Button>
          <span className="text-sm">
            <span className="font-semibold">{post.likes?.length ?? 0}</span>{" "}
            likes
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setExpandedComments((v) => !v)}
          >
            <MessageCircleIcon />
          </Button>
          <span className="text-sm">
            <span className="font-semibold">{commentCount}</span> comments
          </span>
        </div>
      </div>

      {expandedComments && post.comments && post.comments.length > 0 && (
        <div className="flex flex-col border-t p-4 space-y-2">
          {post.comments.map((comment) => (
            <CommentItem key={comment.id} postId={post.id} comment={comment} />
          ))}
        </div>
      )}

      <CommentInput
        member={member}
        onSubmit={handleAddComment}
        isSubmitting={createComment.isPending}
      />
    </div>
  );
}
