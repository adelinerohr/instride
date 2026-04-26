import {
  boardsOptions,
  useCreatePost,
  useUpdatePost,
  type FeedPost,
} from "@instride/api";
import { useForm, useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/shared/components/ui/input-group";

interface PostComposerProps {
  post?: FeedPost;
  onUpdate?: (post: FeedPost) => void;
}

export function PostComposer({ post, onUpdate }: PostComposerProps) {
  const search = useSearch({ strict: false });
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = !!post;

  const form = useForm({
    defaultValues: {
      text: post?.text ?? "",
      boardId: post?.boardId ?? search.boards?.[0] ?? null,
    },
    onSubmit: ({ value }) => {
      if (isEditing) {
        updatePost.mutate(
          { postId: post.id, text: value.text },
          {
            onSuccess: (updated) => {
              form.reset();
              onUpdate?.(updated);
              toast.success("Post updated successfully");
            },
            onError: () => toast.error("Failed to update post"),
          }
        );
      } else {
        createPost.mutate(value, {
          onSuccess: () => {
            form.reset();
            toast.success("Post created successfully");
          },
          onError: () => toast.error("Failed to create post"),
        });
      }
    },
  });

  const selectedBoardId = useStore(form.store, (state) => state.values.boardId);
  const currentBoard = boards?.find((b) => b.id === selectedBoardId);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <InputGroup className="bg-white rounded-lg!">
        <form.Field
          name="text"
          validators={{
            onSubmit: ({ value }) =>
              value.trim().length === 0
                ? "Post content is required"
                : undefined,
          }}
          children={(field) => (
            <InputGroupTextarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
              placeholder={`Share an update with ${currentBoard?.name ? `the ${currentBoard.name}` : "all boards"}...`}
            />
          )}
        />
        <InputGroupAddon align="block-end" className="flex justify-end gap-4">
          <form.Field
            name="boardId"
            children={(field) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <InputGroupButton
                      variant="ghost"
                      aria-label="Select board"
                      className="pr-1.5! text-xs"
                      disabled={form.state.isSubmitting}
                    />
                  }
                >
                  {currentBoard?.name ?? "All Boards"}
                  <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => field.handleChange(null)}>
                    All Boards
                  </DropdownMenuItem>
                  {boards?.map((board) => (
                    <DropdownMenuItem
                      key={board.id}
                      onClick={() => field.handleChange(board.id)}
                    >
                      {board.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          <InputGroupButton
            variant="default"
            type="submit"
            size={null}
            disabled={form.state.isSubmitting}
          >
            {isEditing ? "Update" : "Post"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
