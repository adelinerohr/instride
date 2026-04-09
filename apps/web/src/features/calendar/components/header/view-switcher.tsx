import { CalendarRangeIcon, Columns2Icon, ListIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

import { useCalendarSearch } from "../../hooks/use-calendar-search";
import { CalendarView } from "../../lib/types";

const calendarModes = [
  {
    view: CalendarView.AGENDA,
    icon: CalendarRangeIcon,
    label: "Agenda",
  },
  {
    view: CalendarView.DAY,
    icon: ListIcon,
    label: "Day",
  },
  {
    view: CalendarView.WEEK,
    icon: Columns2Icon,
    label: "Week",
  },
];

export interface ViewSwitcherProps {
  view: CalendarView;
}

export function ViewSwitcher({ view }: ViewSwitcherProps) {
  const { setView } = useCalendarSearch(false);

  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value as CalendarView)}
    >
      <TabsList className="p-0 border divide-x bg-background overflow-hidden">
        {calendarModes.map((mode) => {
          const isSelected = view === mode.view;
          return (
            <TabsTrigger
              key={mode.view}
              value={mode.view}
              className="data-[state=active]:bg-muted shadow-none rounded-none px-4"
            >
              <mode.icon />
              {isSelected && (
                <span
                  className={cn(
                    isSelected ? "opacity-100 w-fit" : "opacity-0 w-0"
                  )}
                >
                  {mode.label}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
