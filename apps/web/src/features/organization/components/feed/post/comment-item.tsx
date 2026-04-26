import {
  useDeleteComment,
  useUpdateComment,
  type FeedComment,
  type Member,
} from "@instride/api";
import { useRouteContext } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { getInitials } from "@/shared/lib/utils/format";

interface ReplyTarget {
  commentId: string;
  authorName: string;
}

interface CommentItemProps {
  comment: FeedComment;
  onReply: (target: ReplyTarget) => void;
}

export function CommentItem({ comment, onReply }: CommentItemProps) {
  const { member } = useRouteContext({ from: "/org/$slug/(authenticated)" });
  const [repliesExpanded, setRepliesExpanded] = React.useState(false);

  const replyCount = comment.replies?.length ?? 0;

  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarImage src={comment.member?.authUser?.image ?? undefined} />
        <AvatarFallback>
          {getInitials(comment.member?.authUser?.name ?? "")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <CommentBody comment={comment} member={member} />

        <CommentActions
          comment={comment}
          onReplyClick={() =>
            onReply({
              commentId: comment.id,
              authorName: comment.member?.authUser?.name ?? "",
            })
          }
        />

        {/* Replies */}
        {replyCount > 0 && (
          <div className="mt-2 space-y-3">
            {!repliesExpanded ? (
              <button
                type="button"
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setRepliesExpanded(true)}
              >
                <span className="h-px w-6 bg-border" aria-hidden />
                View {replyCount === 1 ? "1 reply" : `${replyCount} replies`}
              </button>
            ) : (
              <>
                {comment.replies!.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    member={member}
                    onReplyClick={() =>
                      onReply({
                        commentId: comment.id,
                        authorName: reply.member?.authUser?.name ?? "",
                      })
                    }
                  />
                ))}
                <button
                  type="button"
                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setRepliesExpanded(false)}
                >
                  <span className="h-px w-6 bg-border" aria-hidden />
                  Hide replies
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReplyItemProps {
  reply: FeedComment;
  member: Member;
  onReplyClick: () => void;
}

function ReplyItem({ reply, member, onReplyClick }: ReplyItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar size="xs" className="mt-0.5 shrink-0">
        <AvatarImage src={reply.member?.authUser?.image ?? undefined} />
        <AvatarFallback>
          {getInitials(reply.member?.authUser?.name ?? "")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <CommentBody comment={reply} member={member} />
        <CommentActions comment={reply} onReplyClick={onReplyClick} />
      </div>
    </div>
  );
}

// ---- Shared sub-components --------------------------------------------------

interface CommentBodyProps {
  comment: FeedComment;
  member: Member;
}

function CommentBody({ comment, member }: CommentBodyProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState(comment.text);
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const isOwn = comment.member?.id === member.id;

  const handleEdit = () => {
    if (!editedText.trim()) return;
    updateComment.mutate(
      { commentId: comment.id, text: editedText.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Comment updated");
        },
        onError: () => toast.error("Failed to update comment"),
      }
    );
  };

  const handleDelete = () => {
    confirmationModalHandler.openWithPayload({
      title: "Delete comment",
      description: "Are you sure you want to delete this comment?",
      onConfirm: () => {
        deleteComment.mutate(comment.id, {
          onSuccess: () => toast.success("Comment deleted"),
          onError: () => toast.error("Failed to delete comment"),
        });
      },
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 rounded-md border px-2 py-1">
        <Input
          autoFocus
          className="h-7 border-0 shadow-none focus-visible:ring-0 px-1"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEdit();
            if (e.key === "Escape") {
              setIsEditing(false);
              setEditedText(comment.text);
            }
          }}
          disabled={updateComment.isPending}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={() => {
            setIsEditing(false);
            setEditedText(comment.text);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-6 text-xs"
          disabled={!editedText.trim() || updateComment.isPending}
          onClick={handleEdit}
        >
          Save
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm min-w-0 wrap-break-words">
        <span className="font-semibold">{comment.member?.authUser?.name}</span>{" "}
        {comment.text}
      </p>

      {isOwn && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 text-muted-foreground"
              />
            }
          >
            <MoreHorizontalIcon className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteComment.isPending}
              variant="destructive"
            >
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface CommentActionsProps {
  comment: FeedComment;
  onReplyClick: () => void;
}

function CommentActions({ comment, onReplyClick }: CommentActionsProps) {
  return (
    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
      <span>{formatDistanceToNowStrict(comment.createdAt)}</span>
      <button
        type="button"
        className="font-semibold hover:text-foreground"
        onClick={onReplyClick}
      >
        Reply
      </button>
    </div>
  );
}
