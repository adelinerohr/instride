import { useCreateComment, type FeedPost } from "@instride/api";
import { useRouteContext } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHandler,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { CommentItem } from "./comment-item";

interface CommentSheetPayload {
  post: FeedPost;
}

export const commentSheetHandler =
  SheetHandler.createHandle<CommentSheetPayload>();

export function CommentSheet() {
  return (
    <Sheet handle={commentSheetHandler}>
      {({ payload }) => payload && <PostComments {...payload} />}
    </Sheet>
  );
}

interface ReplyTarget {
  commentId: string;
  authorName: string;
}

function PostComments({ post }: CommentSheetPayload) {
  const { user } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });
  const createComment = useCreateComment();

  const [replyTarget, setReplyTarget] = React.useState<ReplyTarget | null>(
    null
  );
  const [text, setText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length === 0) return;

    createComment.mutate(
      {
        postId: post.id,
        text: trimmed,
        parentCommentId: replyTarget?.commentId,
      },
      {
        onSuccess: () => {
          setText("");
          setReplyTarget(null);
        },
        onError: () => toast.error("Failed to add comment"),
      }
    );
  };

  const handleStartReply = (target: ReplyTarget) => {
    setReplyTarget(target);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <SheetContent
      side="bottom"
      className="flex h-[90dvh] flex-col gap-0 rounded-t-2xl p-0 sm:h-[80dvh]"
    >
      <SheetHeader className="flex-row items-center justify-center border-b px-4 py-3">
        <SheetTitle className="text-base">Comments</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {post.comments && post.comments.length > 0 ? (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleStartReply}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="font-medium">No comments yet</p>
            <p className="text-sm text-muted-foreground">
              Start the conversation.
            </p>
          </div>
        )}
      </div>

      {/* Pinned composer */}
      <div className="border-t bg-background pb-[env(safe-area-inset-bottom)]">
        {replyTarget && (
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-xs text-muted-foreground">
              Replying to{" "}
              <span className="font-medium text-foreground">
                {replyTarget.authorName}
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setReplyTarget(null)}
              aria-label="Cancel reply"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2 p-3">
          <UserAvatar size="sm" user={user} />
          <Input
            ref={inputRef}
            placeholder={
              replyTarget
                ? `Reply to ${replyTarget.authorName}...`
                : "Add a comment..."
            }
            className="flex-1 border-0 shadow-none focus-visible:ring-0"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={createComment.isPending}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-semibold"
            disabled={!text.trim() || createComment.isPending}
            onClick={handleSubmit}
          >
            Post
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
