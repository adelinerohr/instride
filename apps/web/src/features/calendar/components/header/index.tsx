import {
  CalendarPlusIcon,
  ClockIcon,
  PartyPopperIcon,
  PlusIcon,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@/shared/components/ui/dropdown-menu";

import { useCalendar } from "../../hooks/use-calendar";
import { eventModalHandler } from "../modals/event-modal";
import { timeBlockModalHandler } from "../modals/time-block-form";
import { DateNavigator } from "./date-navigator";
import { CalendarFilters } from "./filters";
import { ViewSwitcher } from "./view-switcher";

export function CalendarHeader() {
  const { selectedTrainerIds, selectedBoardId, createLesson, type } =
    useCalendar();

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <DateNavigator />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-2">
        <div className="options flex-wrap flex items-center gap-4 md:gap-2">
          <ViewSwitcher />
          <CalendarFilters />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              <PlusIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit">
              <DropdownMenuGroup>
                {type === "admin" && (
                  <DialogTrigger
                    handle={eventModalHandler}
                    nativeButton={false}
                    render={<DropdownMenuItem />}
                  >
                    <PartyPopperIcon />
                    <span>Add new event</span>
                  </DialogTrigger>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    createLesson({
                      boardId: selectedBoardId ?? "",
                      trainerId: selectedTrainerIds[0] ?? "",
                    })
                  }
                >
                  <CalendarPlusIcon />
                  <span>Add new lesson</span>
                </DropdownMenuItem>
                {type === "admin" && (
                  <DialogTrigger
                    handle={timeBlockModalHandler}
                    nativeButton={false}
                    payload={{
                      defaultTrainerId: selectedTrainerIds[0] ?? undefined,
                    }}
                    render={<DropdownMenuItem />}
                  >
                    <ClockIcon />
                    <span>Add new time block</span>
                  </DialogTrigger>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
