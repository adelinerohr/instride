import {
  useCreateComment,
  useLikePost,
  useUnlikePost,
  type types,
} from "@instride/api";
import type { FeedPost } from "@instride/shared";
import { formatDistanceToNow } from "date-fns";
import {
  FlagIcon,
  HeartIcon,
  Link2Icon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  SendIcon,
  Share2Icon,
} from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { getInitials } from "@/shared/lib/utils/format";

type PostProps = {
  post: FeedPost;
  userMemberId: string;
  user: types.AuthUser;
};

export function Post({ post, userMemberId, user }: PostProps) {
  const [expandedComments, setExpandedComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const createComment = useCreateComment();

  const isLiked = post.likes.some((like) => like.memberId === userMemberId);

  const handleToggleLike = () =>
    isLiked ? unlikePost.mutate(post.id) : likePost.mutate(post.id);

  const handleAddComment = () =>
    createComment.mutate({
      postId: post.id,
      request: { text: newComment, memberId: userMemberId },
    });

  return (
    <div className="space-y-3 rounded-xl border bg-white w-full">
      <div className="space-y-3 p-4 pb-0">
        {/* Post Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.authUser.image ?? undefined} />
              <AvatarFallback>
                {getInitials(post.author.authUser.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold">
                  {post.author.authUser.name}
                </span>
              </div>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(post.createdAt)} ago
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.board ? (
              <Badge>{post.board.name}</Badge>
            ) : (
              <Badge variant="secondary">All Boards</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" />}
              >
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link2Icon />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2Icon />
                  Share to...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <FlagIcon className="text-destructive" />
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Post Content */}
        <div className="rounded-lg">
          <p className="text-sm whitespace-pre-line">{post.text}</p>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleToggleLike}
            >
              <HeartIcon
                className={cn(isLiked && "text-destructive fill-destructive")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setExpandedComments(!expandedComments)}
            >
              <MessageCircleIcon />
            </Button>
            <Button variant="ghost" className="rounded-full" size="icon">
              <SendIcon />
            </Button>
          </div>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {post.likes.map((like) => (
              <Avatar
                className="border-background h-5 w-5 border-2"
                key={like.memberId}
              >
                <AvatarImage src={like.member.authUser.image ?? undefined} />
                <AvatarFallback>
                  {getInitials(like.member.authUser.name ?? "")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm">
            <span className="font-semibold" suppressHydrationWarning>
              {post.likes.length}
            </span>{" "}
            likes
          </span>
        </div>

        {/* Comments Link */}
        {post.comments.length > 0 ? (
          <Button
            variant="link"
            className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs font-normal"
            onClick={() => setExpandedComments(!expandedComments)}
          >
            {expandedComments
              ? "Hide comments"
              : `View all ${post.comments.length} comments`}
          </Button>
        ) : (
          <span className="text-muted-foreground text-xs">No comments yet</span>
        )}

        {/* Comments Section */}
        {expandedComments && (
          <div className="space-y-3 border-t pt-3">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={comment.member.authUser.image ?? undefined}
                  />
                  <AvatarFallback>
                    {getInitials(comment.member.authUser.name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-semibold">
                        {comment.member.authUser.name}
                      </span>
                      <span className="ml-2 text-sm">{comment.text}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <HeartIcon />
                    </Button>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(comment.createdAt)}
                    </span>
                    <span className="text-muted-foreground text-xs">likes</span>
                    <button className="text-muted-foreground hover:text-foreground text-xs font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment */}
      <div className="flex items-center gap-1 border-t p-4 pt-3">
        <Avatar>
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{getInitials(user.name ?? "")}</AvatarFallback>
        </Avatar>
        <Input
          placeholder="Add a comment..."
          className="flex-1 border-0 shadow-none focus-visible:ring-0"
          value={newComment || ""}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddComment();
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={!newComment?.trim()}
          onClick={handleAddComment}
        >
          Post
        </Button>
      </div>
    </div>
  );
}
