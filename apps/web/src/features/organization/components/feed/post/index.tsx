import { useLikePost, useUnlikePost, type FeedPost } from "@instride/api";
import { useRouteContext } from "@tanstack/react-router";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { PostComposer } from "../composer";
import { CommentSheet, commentSheetHandler } from "./comment-sheet";
import { PostHeader } from "./header";

type PostProps = {
  post: FeedPost;
};

export function Post({ post }: PostProps) {
  const { member, user } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });
  const [isEditing, setIsEditing] = React.useState(false);

  const likePost = useLikePost({
    userMemberId: member.id,
    user,
  });
  const unlikePost = useUnlikePost();

  const isLiked = post.likes?.some((like) => like.memberId === member.id);
  const userLike = post.likes?.find((like) => like.memberId === member.id);
  const isUserPost = post.authorMemberId === member.id;

  const commentCount =
    (post.comments?.length ?? 0) +
    (post.comments?.reduce(
      (acc, comment) => acc + (comment.replies?.length ?? 0),
      0
    ) ?? 0);

  const topComments = post.comments?.slice(0, 2) ?? [];

  const handleToggleLike = () => {
    if (isLiked && userLike) {
      unlikePost.mutate({ likeId: userLike.id, postId: post.id });
    } else {
      likePost.mutate(post.id);
    }
  };

  return (
    <>
      <div className="w-full rounded-xl border bg-card">
        <div className="space-y-3 p-4">
          <PostHeader
            post={post}
            isUserPost={isUserPost}
            onEdit={() => setIsEditing(true)}
          />

          {isEditing ? (
            <PostComposer post={post} onUpdate={() => setIsEditing(false)} />
          ) : (
            <p className="whitespace-pre-line text-sm">{post.text}</p>
          )}

          {/* Engagement row — flat icons, compact counts */}
          <div className="flex items-center gap-2 -ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleToggleLike}
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <HeartIcon
                className={cn(
                  "size-5",
                  isLiked && "fill-destructive text-destructive"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => commentSheetHandler.openWithPayload({ post })}
              aria-label="View comments"
            >
              <MessageCircleIcon className="size-5" />
            </Button>
          </div>

          {(post.likes?.length ?? 0) > 0 && (
            <p className="text-sm font-semibold">
              {post.likes!.length} {post.likes!.length === 1 ? "like" : "likes"}
            </p>
          )}

          {/* Comment teaser — Instagram-style */}
          {commentCount > 0 && (
            <div className="space-y-1">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:underline"
                onClick={() => commentSheetHandler.openWithPayload({ post })}
              >
                View{" "}
                {commentCount === 1
                  ? "1 comment"
                  : `all ${commentCount} comments`}
              </button>
              {topComments.map((comment) => (
                <p key={comment.id} className="text-sm line-clamp-1">
                  <span className="font-semibold">
                    {comment.member?.authUser?.name}
                  </span>{" "}
                  {comment.text}
                </p>
              ))}
            </div>
          )}

          {commentCount === 0 && (
            <button
              type="button"
              className="text-sm text-muted-foreground hover:underline"
              onClick={() => commentSheetHandler.openWithPayload({ post })}
            >
              Add a comment...
            </button>
          )}
        </div>
      </div>
      <CommentSheet />
    </>
  );
}
