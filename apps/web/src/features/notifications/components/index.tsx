import { BellIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export function NotificationsDropdown() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" />}>
        <BellIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-fit">
        <div className="p-2 border-b space-y-2">
          <h2 className="text-lg font-semibold font-display">Notifications</h2>
        </div>
      </PopoverContent>
    </Popover>
  );
}
