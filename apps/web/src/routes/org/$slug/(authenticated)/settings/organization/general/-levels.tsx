import { levelOptions, useDeleteLevel } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChartAreaIcon, MoreHorizontalIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import {
  LevelModal,
  levelModalHandler,
} from "@/features/organization/components/levels/modal";
import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

export function OrganizationLevelsCard() {
  const { data: levels, isLoading } = useSuspenseQuery(levelOptions.list());
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const deleteLevel = useDeleteLevel();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const filteredLevels = levels.filter((level) => {
    return (
      !searchQuery ||
      level.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
    );
  });

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target?.value || "");
  };

  return (
    <Card className="flex h-full flex-col gap-0 pb-0">
      <CardHeader className="pb-0 flex flex-row items-center gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Filter by level name"
            value={searchQuery}
            onChange={handleSearchQueryChange}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <DialogTrigger
          handle={levelModalHandler}
          render={<Button className="whitespace-nowrap" />}
        >
          Create level
        </DialogTrigger>
      </CardHeader>
      <CardContent className="max-h-72 flex-1 overflow-hidden p-0">
        {filteredLevels.length > 0 ? (
          <ScrollArea className="h-full">
            <ul role="list" className="m-0 list-none divide-y p-0">
              {levels.map((level) => (
                <li
                  key={level.id}
                  role="listitem"
                  className="flex w-full flex-row items-center justify-between p-6"
                >
                  <div className="flex flex-row items-center gap-4">
                    <div
                      className="size-4 rounded-full"
                      style={{ background: level.color }}
                    />
                    <div className="flex flex-col">
                      <div className="font-medium">{level.name}</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        {level.description ??
                          "No description set for this level."}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          className="size-8 p-0"
                          title="Open menu"
                        />
                      }
                    >
                      <MoreHorizontalIcon className="size-4 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DialogTrigger
                        handle={levelModalHandler}
                        payload={{ level }}
                        nativeButton={false}
                        render={<DropdownMenuItem />}
                      >
                        Edit
                      </DialogTrigger>
                      <DialogTrigger
                        handle={confirmationModalHandler}
                        payload={{
                          title: `Delete level: ${level?.name}`,
                          description: `Are you sure you want to delete this level? This action cannot be undone.`,
                          confirmLabel: "Delete",
                          cancelLabel: "Cancel",
                          onConfirm: () => deleteLevel.mutateAsync(level.id),
                        }}
                        nativeButton={false}
                        render={<DropdownMenuItem />}
                      >
                        Delete
                      </DialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartAreaIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No levels found</EmptyTitle>
              <EmptyDescription>
                Create a level or change search query.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <LevelModal />
    </Card>
  );
}
