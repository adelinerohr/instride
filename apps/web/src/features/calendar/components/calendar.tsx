import { CalendarView } from "../lib/types";
import { CalendarHeader, type CalendarHeaderProps } from "./header";
import { AgendaView, type AgendaViewProps } from "./views/agenda";
import { DayView, type DayViewProps } from "./views/day";
import { WeekView, type WeekViewProps } from "./views/week";

export interface CalendarPageProps {
  view: CalendarView;
  headerProps: CalendarHeaderProps;
  weekViewProps: WeekViewProps;
  dayViewProps: DayViewProps;
  agendaViewProps: AgendaViewProps;
}

export function CalendarPage({
  view,
  headerProps,
  weekViewProps,
  dayViewProps,
  agendaViewProps,
}: CalendarPageProps) {
  return (
    <div className="flex min-h-0 h-full flex-col overflow-hidden">
      <CalendarHeader {...headerProps} />
      <div className="flex-1 min-h-0">
        {view === CalendarView.WEEK && <WeekView {...weekViewProps} />}
        {view === CalendarView.DAY && <DayView {...dayViewProps} />}
        {view === CalendarView.AGENDA && <AgendaView {...agendaViewProps} />}
      </div>
    </div>
  );
}
