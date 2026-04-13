import { Link, useParams } from "@tanstack/react-router";
import { CalendarPlusIcon, ClockIcon, PlusIcon } from "lucide-react";

import { newLessonModalHandler } from "@/features/lessons/components/modals/new-lesson";
import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/shared/components/ui/dropdown-menu";

import { useCalendar } from "../../hooks/use-calendar";
import { timeBlockModalHandler } from "../modals/time-block-form";
import { DateNavigator } from "./date-navigator";
import { CalendarFilters } from "./filters";
import { ViewSwitcher } from "./view-switcher";

export function CalendarHeader() {
  const { slug } = useParams({ strict: false });
  const { selectedTrainerIds, selectedBoardId } = useCalendar();

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
              <DropdownMenuItem
                render={
                  <Link
                    to="/org/$slug/admin/calendar/new"
                    params={{ slug: slug ?? "" }}
                  />
                }
              >
                <CalendarPlusIcon />
                <span>Add new event</span>
              </DropdownMenuItem>
              <DialogTrigger
                handle={newLessonModalHandler}
                nativeButton={false}
                payload={{
                  boardId: selectedBoardId ?? "",
                  trainerId: selectedTrainerIds[0] ?? "",
                }}
                render={<DropdownMenuItem />}
              >
                <CalendarPlusIcon />
                <span>Add new lesson</span>
              </DialogTrigger>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
