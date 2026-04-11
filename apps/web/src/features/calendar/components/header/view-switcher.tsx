import { CalendarRangeIcon, Columns2Icon, ListIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";

import { useCalendar } from "../../hooks/use-calendar";
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

export function ViewSwitcher() {
  const { selectedView, setSelectedView } = useCalendar();

  return (
    <ButtonGroup>
      {calendarModes.map((mode) => (
        <Button
          key={mode.view}
          variant={selectedView === mode.view ? "default" : "outline"}
          onClick={() => setSelectedView(mode.view)}
        >
          <mode.icon />
          {selectedView === mode.view && mode.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
