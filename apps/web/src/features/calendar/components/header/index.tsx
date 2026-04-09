import type { types } from "@instride/api";
import { Link } from "@tanstack/react-router";
import { CalendarPlusIcon, ClockIcon, PlusIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/shared/components/ui/dropdown-menu";

import { CalendarView } from "../../lib/types";
import { DateNavigator } from "./date-navigator";
import { CalendarFilters } from "./filters";
import { ViewSwitcher } from "./view-switcher";

export interface CalendarHeaderProps {
  slug: string;
  date: Date;
  view: CalendarView;
  boards: types.Board[];
  trainers: types.Trainer[];
  selectedBoardId?: string;
  selectedTrainerIds: string[];
}

export function CalendarHeader({
  slug,
  date,
  view,
  boards,
  trainers,
  selectedBoardId,
  selectedTrainerIds,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <DateNavigator date={date} view={view} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-2">
        <div className="options flex-wrap flex items-center gap-4 md:gap-2">
          <ViewSwitcher view={view} />
          <CalendarFilters
            allowedBoards={boards}
            selectedBoardId={selectedBoardId}
            selectedTrainerIds={selectedTrainerIds}
            trainers={trainers}
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              <PlusIcon />
              Add
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit">
              <DropdownMenuItem
                render={
                  <Link to="/org/$slug/admin/calendar/new" params={{ slug }} />
                }
              >
                <CalendarPlusIcon />
                <span>Add new event</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    to="/org/$slug/admin/calendar"
                    search={(prev) => ({ ...prev, createTimeBlock: true })}
                    params={{ slug }}
                  />
                }
              >
                <ClockIcon />
                <span>Add new time block</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
