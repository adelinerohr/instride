import { SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";

import { CalendarFilters } from "../header/filters";

export function MobileFilterSheet() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        <CalendarFilters />
      </div>
    </>
  );
}
