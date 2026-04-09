import type { Trainer, Board } from "@instride/shared";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import type { FeedSearchParams } from "@/shared/lib/search/feed";
import { cn } from "@/shared/lib/utils";
import { getInitials } from "@/shared/lib/utils/format";

type FeedFiltersProps = {
  search: FeedSearchParams;
  onUpdateFilter: (updates: Partial<FeedSearchParams>) => void;
  trainers: Trainer[];
  boards: Board[];
};

export function FeedFilters({
  search,
  onUpdateFilter,
  trainers,
  boards,
}: FeedFiltersProps) {
  const [localQuery, setLocalQuery] = React.useState(search.query ?? "");

  React.useEffect(() => {
    setLocalQuery(search.query ?? "");
  }, [search.query]);

  const hasActiveFilters = search.board || search.author || search.query;

  const selectedAuthor = trainers?.find((t) => t.memberId === search.author);

  const handleAuthorSelect = (trainerId: string) => {
    if (trainerId === search.author) {
      onUpdateFilter({ author: undefined });
    } else {
      onUpdateFilter({ author: trainerId });
    }
  };

  const handleBoardSelect = (boardId: string) => {
    if (boardId === search.board) {
      onUpdateFilter({ board: undefined });
    } else {
      onUpdateFilter({ board: boardId });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (e.currentTarget.value.length === 0) {
        onUpdateFilter({ query: undefined });
        setLocalQuery("");
      } else {
        onUpdateFilter({ query: e.currentTarget.value });
        setLocalQuery(e.currentTarget.value);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex-col sm:flex-row flex items-center gap-4">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search posts..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {search.query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => {
                  onUpdateFilter({ query: undefined });
                  setLocalQuery("");
                }}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
          {/* Board Filter */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full sm:w-[200px] justify-between bg-white"
                />
              }
            >
              {search.board
                ? boards?.find((b) => b.id === search.board)?.name
                : "All Boards"}
              <ChevronsUpDownIcon className="opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
              <Command>
                <CommandInput placeholder="Search boards..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No board found.</CommandEmpty>
                  <CommandGroup>
                    {boards?.map((board) => (
                      <CommandItem
                        key={board.id}
                        value={board.id}
                        onSelect={() => handleBoardSelect(board.id)}
                      >
                        {board.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            search.board === board.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Author Filter */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full sm:w-[200px] justify-between bg-white"
                />
              }
            >
              {search.author
                ? selectedAuthor?.member.authUser.name
                : "All Authors"}
              <ChevronsUpDownIcon className="opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
              <Command>
                <CommandInput
                  placeholder="Search trainers..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>No trainer found.</CommandEmpty>
                  <CommandGroup>
                    {trainers?.map((trainer) => (
                      <CommandItem
                        key={trainer.memberId}
                        value={trainer.memberId}
                        onSelect={() => handleAuthorSelect(trainer.memberId)}
                      >
                        <Avatar className="size-4">
                          <AvatarImage
                            src={trainer.member.authUser.image ?? ""}
                          />
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {getInitials(trainer.member.authUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        {trainer.member.authUser.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            search.author === trainer.memberId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex gap-2 flex-wrap">
          {search.board && (
            <FilterBadge
              label={`Board: ${boards?.find((b) => b.id === search.board)?.name}`}
              onRemove={() => onUpdateFilter({ board: undefined })}
            />
          )}
          {search.author && (
            <FilterBadge
              label={`Author: ${trainers?.find((t) => t.memberId === search.author)?.member.authUser.name}`}
              onRemove={() => onUpdateFilter({ author: undefined })}
            />
          )}
          {search.query && (
            <FilterBadge
              label={`Query: ${search.query}`}
              onRemove={() => onUpdateFilter({ query: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" onClick={onRemove} className="cursor-pointer">
      {label}
      <XIcon />
    </Badge>
  );
}
