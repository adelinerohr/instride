import { getUser } from "@instride/api";
import * as React from "react";

import {
  UserAvatar,
  UserAvatarItem,
} from "@/shared/components/fragments/user-avatar";
import { AvatarGroup } from "@/shared/components/ui/avatar";
import { Item, ItemContent, ItemMedia } from "@/shared/components/ui/item";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

import { useCalendar } from "../../hooks/use-calendar";

export function CalendarFilters({
  className,
  fullWidth = false,
  ...props
}: React.ComponentProps<"div"> & { fullWidth?: boolean }) {
  const {
    setSelectedBoardId,
    setSelectedTrainerIds,
    trainers,
    selectedBoardId,
    selectedTrainerIds,
    boards,
  } = useCalendar();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!trainers || trainers.length === 0) return;
    if (selectedTrainerIds.length > 0) return;

    if (isMobile) {
      // Single trainer on mobile
      setSelectedTrainerIds([trainers[0].id]);
    } else {
      // All trainers on desktop
      setSelectedTrainerIds(trainers.map((t) => t.id));
    }
  }, [trainers, selectedTrainerIds, setSelectedTrainerIds, isMobile]);

  if (!trainers) return null;

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Select
        value={selectedBoardId}
        onValueChange={(value) => setSelectedBoardId(value ?? undefined)}
      >
        <SelectTrigger className={cn(fullWidth && "w-full!")}>
          <SelectValue>
            {(value) => {
              if (value) {
                return boards.find((board) => board.id === value)?.name;
              }
              return "Select board";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value={null}>Select board</SelectItem>
          {boards.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              {board.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isMobile ? (
        <Select
          value={selectedTrainerIds[0] ?? ""}
          onValueChange={(value) => setSelectedTrainerIds(value ? [value] : [])}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => {
                if (!value) return "Select trainer";
                const trainer = trainers.find((t) => t.id === value);
                const name = trainer
                  ? getUser({ trainer }).name
                  : "Select trainer";
                return name;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {trainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  <UserAvatarItem user={getUser({ trainer })} />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <Select
          multiple
          value={selectedTrainerIds}
          onValueChange={setSelectedTrainerIds}
        >
          <SelectTrigger className={cn(fullWidth ? "w-full!" : "w-fit")}>
            <SelectValue>
              {(value: string[]) => {
                if (value.length === 0) {
                  return "Select trainers";
                }

                if (value.length === 1) {
                  const selectedTrainer = trainers.find(
                    (trainer) => trainer.id === value[0]
                  );
                  if (!selectedTrainer) return "Select trainer";

                  return (
                    <UserAvatarItem
                      user={getUser({ trainer: selectedTrainer })}
                    />
                  );
                }

                const selectedTrainers = value.map((id) =>
                  trainers.find((trainer) => trainer.id === id)
                );

                return (
                  <Item size="xs" className="w-full p-0 flex-nowrap">
                    <ItemMedia>
                      <AvatarGroup>
                        {selectedTrainers.map((trainer) => (
                          <UserAvatar
                            size="sm"
                            user={getUser({ trainer })}
                            key={trainer?.id}
                          />
                        ))}
                      </AvatarGroup>
                    </ItemMedia>
                    <ItemContent>
                      {selectedTrainers.length} trainers selected
                    </ItemContent>
                  </Item>
                );
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {trainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  <UserAvatarItem
                    user={getUser({ trainer })}
                    className="w-full flex-nowrap"
                  />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
