import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Item, ItemContent, ItemMedia } from "@/shared/components/ui/item";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { getInitials } from "@/shared/lib/utils/format";

import { useCalendar } from "../../hooks/use-calendar";

export function CalendarFilters() {
  const {
    setSelectedBoardId,
    setSelectedTrainerIds,
    trainers,
    selectedBoardId,
    selectedTrainerIds,
    boards,
  } = useCalendar();

  React.useEffect(() => {
    // Initialize selected trainer ids with all trainer ids if no selected trainer ids are provided
    if (trainers && trainers.length > 0) {
      if (!selectedTrainerIds || selectedTrainerIds.length === 0) {
        const allTrainerIds = trainers.map((trainer) => trainer.id);
        setSelectedTrainerIds(allTrainerIds);
      }
    }
  }, [trainers, selectedBoardId, selectedTrainerIds, setSelectedTrainerIds]);

  if (!trainers) return null;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedBoardId}
        onValueChange={(value) => setSelectedBoardId(value ?? undefined)}
      >
        <SelectTrigger>
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
      <Select
        multiple
        value={selectedTrainerIds}
        onValueChange={setSelectedTrainerIds}
      >
        <SelectTrigger className="w-56">
          <SelectValue>
            {(value: string[]) => {
              if (value.length === 0) {
                return "Select trainers";
              }
              if (value.length === 1) {
                const selectedTrainer = trainers.find(
                  (trainer) => trainer.id === value[0]
                );
                return (
                  <Item size="xs" className="w-full p-0">
                    <ItemMedia>
                      <Avatar className="size-4">
                        <AvatarImage
                          src={
                            selectedTrainer?.member?.authUser?.image ??
                            undefined
                          }
                          alt={selectedTrainer?.member?.authUser?.name}
                        />
                        <AvatarFallback className="text-[8px]">
                          {getInitials(selectedTrainer?.member?.authUser?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      {selectedTrainer?.member?.authUser?.name}
                    </ItemContent>
                  </Item>
                );
              }
              const selectedTrainers = value.map((id) =>
                trainers.find((trainer) => trainer.id === id)
              );
              return (
                <Item size="xs" className="w-full p-0">
                  <ItemMedia>
                    <AvatarGroup>
                      {selectedTrainers.map((trainer) => (
                        <Avatar key={trainer?.id} className="size-4">
                          <AvatarImage
                            src={trainer?.member?.authUser?.image ?? undefined}
                            alt={trainer?.member?.authUser?.name}
                          />
                          <AvatarFallback className="text-[8px]">
                            {getInitials(trainer?.member?.authUser?.name)}
                          </AvatarFallback>
                        </Avatar>
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
                <Item size="xs" className="w-full p-0">
                  <ItemMedia>
                    <Avatar size="sm">
                      <AvatarImage
                        src={trainer.member?.authUser?.image ?? undefined}
                        alt={trainer.member?.authUser?.name}
                      />
                      <AvatarFallback>
                        {getInitials(trainer.member?.authUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>{trainer.member?.authUser?.name}</ItemContent>
                </Item>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
