import {
  getUser,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
  type types,
} from "@instride/api";
import { useRouteContext } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
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

// ---- CommentItem (top-level comment with reply support) ----------------------

interface CommentItemProps {
  postId: string;
  comment: types.FeedComment;
}

export function CommentItem({ postId, comment }: CommentItemProps) {
  const { member } = useRouteContext({ strict: false });
  const [isReplying, setIsReplying] = React.useState(false);
  const createComment = useCreateComment();

  if (!member) return null;

  const handleReply = (text: string) => {
    createComment.mutate(
      { postId, request: { text, parentCommentId: comment.id } },
      {
        onSuccess: () => setIsReplying(false),
        onError: () => toast.error("Failed to reply to comment"),
      }
    );
  };

  return (
    <div className="flex gap-3">
      <Avatar size="sm">
        <AvatarImage src={comment.member?.authUser?.image ?? undefined} />
        <AvatarFallback>
          {getInitials(comment.member?.authUser?.name ?? "")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="space-y-0">
          <CommentContent comment={comment} member={member} />
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt)} ago
            </span>
            <button
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setIsReplying((v) => !v)}
            >
              Reply
            </button>
          </div>
        </div>

        {isReplying && (
          <ReplyInput
            member={member}
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
            isSubmitting={createComment.isPending}
          />
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar size="sm">
                  <AvatarImage
                    src={reply.member?.authUser?.image ?? undefined}
                  />
                  <AvatarFallback>
                    {getInitials(reply.member?.authUser?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-0">
                  <CommentContent comment={reply} member={member} />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(reply.createdAt)} ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- CommentContent (shared between comments and replies) --------------------

interface CommentContentProps {
  comment: types.FeedComment;
  member: types.Member;
}

function CommentContent({ comment, member }: CommentContentProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState(comment.text);
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();

  const isOwn = comment.member?.id === member.id;

  const handleDelete = () => {
    confirmationModalHandler.openWithPayload({
      title: "Delete Comment",
      description: "Are you sure you want to delete this comment?",
      onConfirm: () => {
        deleteComment.mutate(comment.id, {
          onSuccess: () => toast.success("Comment deleted"),
          onError: () => toast.error("Failed to delete comment"),
        });
      },
    });
  };

  const handleEdit = () => {
    if (!editedText.trim()) return;
    updateComment.mutate(
      { commentId: comment.id, request: { text: editedText.trim() } },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Comment updated");
        },
        onError: () => toast.error("Failed to update comment"),
      }
    );
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <span className="text-sm font-semibold">
          {comment.member?.authUser?.name}
        </span>
        {isEditing ? (
          <div className="mt-1 flex items-center gap-1 rounded-lg border px-3 py-1.5">
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
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
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(comment.text);
                }}
                disabled={updateComment.isPending}
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
          </div>
        ) : (
          <span className="ml-2 text-sm">{comment.text}</span>
        )}
      </div>
      {isOwn && !isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" />}
          >
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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

// ---- ReplyInput --------------------------------------------------------------

interface ReplyInputProps {
  member: types.Member;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function ReplyInput({
  member,
  onSubmit,
  onCancel,
  isSubmitting,
}: ReplyInputProps) {
  const [text, setText] = React.useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <Avatar size="sm">
        <AvatarImage src={member.authUser?.image ?? undefined} />
        <AvatarFallback>
          {getInitials(member.authUser?.name ?? "")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 items-center gap-1 rounded-lg border px-3 py-1.5">
        <input
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Write a reply..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onCancel();
          }}
          disabled={isSubmitting}
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-6 text-xs"
            disabled={!text.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- CommentInput ------------------------------------------------------------

interface CommentInputProps {
  member?: types.Member;
  user?: types.AuthUser;
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
}

export function CommentInput({
  member,
  user,
  onSubmit,
  isSubmitting,
}: CommentInputProps) {
  const [text, setText] = React.useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="flex items-center gap-1 border-t p-4 pt-3">
      <UserAvatar size="sm" user={user ?? getUser({ member })} />
      <Input
        placeholder="Add a comment..."
        className="flex-1 border-0 shadow-none focus-visible:ring-0"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={isSubmitting}
      />
      <Button
        variant="ghost"
        size="sm"
        disabled={!text.trim() || isSubmitting}
        onClick={handleSubmit}
      >
        Comment
      </Button>
    </div>
  );
}
