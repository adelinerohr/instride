import { useCalendar } from "@/features/calendar/hooks/use-calendar";

import { AdminHourCell } from "./admin";
import { KioskHourCell } from "./kiosk";
import { PortalHourCell } from "./portal";

export interface HourCellProps {
  isDisabled: boolean;
  index: number;
  day: Date;
  hour: number;
  trainerId?: string;
}

export function HourCell(props: HourCellProps) {
  const { type } = useCalendar();

  switch (type) {
    case "admin":
      return <AdminHourCell {...props} />;
    case "portal":
      return <PortalHourCell {...props} />;
    case "kiosk":
      return <KioskHourCell {...props} />;
  }
}
