import { boardsOptions, membersOptions, type types } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/shared/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import type { FeedSearchParams } from "@/shared/lib/search/feed";
import { getInitials } from "@/shared/lib/utils/format";

export function FeedFilters() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

  const inputRef = React.useRef<HTMLInputElement>(null);
  const trainersAnchor = useComboboxAnchor();
  const boardsAnchor = useComboboxAnchor();

  const selectedAuthors = search.authors?.map((author) =>
    trainers?.find((t) => t.memberId === author)
  );
  const selectedBoards = search.boards?.map((board) =>
    boards?.find((b) => b.id === board)
  );

  const updateFilter = (updates: Partial<FeedSearchParams>) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        ...updates,
      }),
    });
  };

  return (
    <div className="bg-white rounded-lg border p-4 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-4">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          placeholder="Search posts..."
          defaultValue={search.query ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = e.currentTarget.value.trim();
              updateFilter({ query: value });
            }
          }}
        />
        {search.query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={() => {
                updateFilter({ query: undefined });
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {/* Board Filter */}
      <Combobox
        multiple
        autoHighlight
        items={boards}
        itemToStringValue={(board) => board?.name ?? "All boards"}
        value={selectedBoards}
        onValueChange={(values) => {
          updateFilter({ boards: values.map((v) => v?.id ?? "") });
        }}
      >
        <ComboboxChips ref={boardsAnchor} className="w-full">
          <ComboboxValue>
            {(values) => (
              <React.Fragment>
                {values.map((value: types.Board) => (
                  <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Select boards" />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={boardsAnchor}>
          <ComboboxEmpty>No boards found.</ComboboxEmpty>
          <ComboboxList>
            {boards.map((board) => (
              <ComboboxItem key={board.id} value={board.id}>
                {board.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {/* Author Filter */}
      <Combobox
        multiple
        autoHighlight
        items={trainers}
        value={selectedAuthors}
        onValueChange={(values) => {
          updateFilter({ authors: values.map((v) => v?.memberId ?? "") });
        }}
      >
        <ComboboxChips ref={trainersAnchor} className="w-full">
          <ComboboxValue>
            {(values) => (
              <React.Fragment>
                {values.map((value: types.Trainer) => (
                  <ComboboxChip key={value.memberId}>
                    {value.member?.authUser?.name}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Select trainers" />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={trainersAnchor}>
          <ComboboxEmpty>No trainers found.</ComboboxEmpty>
          <ComboboxList>
            {(trainer: types.Trainer) => (
              <ComboboxItem key={trainer.memberId} value={trainer.memberId}>
                <Item size="xs" className="p-0">
                  <ItemMedia>
                    <Avatar size="sm">
                      <AvatarImage
                        src={trainer.member?.authUser?.image ?? ""}
                        alt={trainer.member?.authUser?.name ?? ""}
                      />
                      <AvatarFallback>
                        {getInitials(trainer.member?.authUser?.name ?? "")}
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {trainer.member?.authUser?.name}
                    </ItemTitle>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
