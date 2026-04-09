import type { Board } from "@instride/shared";
import { useForm, useStore } from "@tanstack/react-form";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { z } from "zod";

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
import type { FeedSearchParams } from "@/shared/lib/search/feed";

type PostComposerProps = {
  search: FeedSearchParams;
  boards: Board[];
};

export function PostComposer({ search, boards }: PostComposerProps) {
  const form = useForm({
    defaultValues: {
      text: "",
      boardId: search.board ?? undefined,
    },
    validators: {
      onSubmit: () =>
        z.object({
          text: z.string().min(1, "Post content is required"),
          boardId: z.string().nullable(),
        }),
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  React.useEffect(() => {
    form.setFieldValue("boardId", search.board ?? undefined);
  }, [search.board]);

  const selectedBoard = useStore(form.store, (state) => state.values.boardId);
  const currentBoard = boards?.find((board) => board.id === selectedBoard);

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
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <InputGroupTextarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder={`Share an update with ${currentBoard?.name ? `the ${currentBoard?.name}` : "all boards"}...`}
              />
            );
          }}
        />
        <InputGroupAddon align="block-end" className="flex justify-end gap-4">
          <form.Field
            name="boardId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <InputGroupButton
                        variant="ghost"
                        aria-label="More"
                        className="pr-1.5! text-xs"
                        aria-invalid={isInvalid}
                        disabled={form.state.isSubmitting}
                      />
                    }
                  >
                    {selectedBoard
                      ? boards?.find((b) => b.id === selectedBoard)?.name
                      : "All Boards"}
                    <ChevronDownIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => field.handleChange(undefined)}
                    >
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
              );
            }}
          />
          <InputGroupButton variant="default" type="submit" size={null}>
            Post
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
