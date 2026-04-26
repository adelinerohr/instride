import type { FeedPost } from "@instride/api";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontalIcon,
  Link2Icon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
} from "lucide-react";

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
import { getInitials } from "@/shared/lib/utils/format";

interface PostHeaderProps {
  post: FeedPost;
  isUserPost: boolean;
  onEdit: () => void;
}

export function PostHeader({ post, isUserPost, onEdit }: PostHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={post.author?.authUser?.image ?? undefined} />
          <AvatarFallback>
            {getInitials(post.author?.authUser?.name ?? "")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">
            {post.author?.authUser?.name}
          </span>
          <span className="text-xs text-muted-foreground">
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
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link2Icon />
              Copy Link
            </DropdownMenuItem>
            {isUserPost && (
              <DropdownMenuItem onClick={onEdit}>
                <PencilIcon />
                Edit Post
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              {isUserPost ? (
                <TrashIcon className="text-destructive" />
              ) : (
                <FlagIcon className="text-destructive" />
              )}
              {isUserPost ? "Delete Post" : "Report Post"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
