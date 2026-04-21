import { format } from "date-fns";
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

import { useCalendar } from "../../hooks/use-calendar";
import { CalendarFilters } from "../header/filters";

export function MobileHeader() {
  const {
    selectedDate,
    createLesson,
    selectedBoardId,
    selectedTrainerIds,
    type,
  } = useCalendar();

  const monthYear = format(selectedDate, "MMMM yyyy").toUpperCase();
  const dayName = format(selectedDate, "EEEE d");

  const activeFilterCount =
    (selectedBoardId ? 1 : 0) + (selectedTrainerIds.length > 0 ? 1 : 0);

  const handleCreate = () => {
    createLesson({
      boardId: selectedBoardId ?? "",
      trainerId: selectedTrainerIds[0] ?? "",
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 text-primary-foreground">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium tracking-widest text-primary-foreground/70">
          {monthYear}
        </span>
        <span className="text-2xl font-bold">{dayName}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
          aria-label="Search"
          // TODO: wire up search — deferred
        >
          <SearchIcon className="size-4" />
        </Button>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative size-9 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                aria-label="Filters"
              />
            }
          >
            <FilterIcon className="size-4" />
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
              >
                {activeFilterCount}
              </Badge>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85svh]! gap-0">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <CalendarFilters
              fullWidth
              className="flex flex-col gap-4 overflow-y-auto p-4"
            />
          </SheetContent>
        </Sheet>
        <Button
          variant="default"
          size="icon"
          className="size-9 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={handleCreate}
          aria-label="Create lesson"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
