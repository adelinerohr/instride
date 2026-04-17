import { format, parseISO } from "date-fns";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface TimeSlotButtonProps {
  slot: {
    start: string;
    end: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export function TimeSlotButton({
  slot,
  isSelected,
  onClick,
}: TimeSlotButtonProps) {
  const startTime = parseISO(slot.start);

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      type="button"
      size="sm"
      className={cn(
        "w-full flex flex-col items-center py-3 h-auto",
        isSelected && "ring-2 ring-offset-2"
      )}
      onClick={onClick}
    >
      <span className="font-semibold">{format(startTime, "h:mm a")}</span>
    </Button>
  );
}
