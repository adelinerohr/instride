import type { Row, Table as TanstackTable } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import * as React from "react";

import { useHotKey } from "@/shared/hooks/use-hot-key";

import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface DataTableActionBarProps<TData> {
  table: TanstackTable<TData>;
  children: (props: {
    rows: Row<TData>[];
    table: TanstackTable<TData>;
  }) => React.ReactNode;
}

export function DataTableActionBar<TData>({
  table,
  children,
}: DataTableActionBarProps<TData>) {
  const rowSelection = table.getFilteredSelectedRowModel().rows;
  const selectedRowCount = Object.keys(rowSelection).length;

  const selectedRows = React.useMemo(() => {
    return table.getFilteredSelectedRowModel().rows;
  }, [table, rowSelection]);

  useHotKey(() => table.resetRowSelection(), "x", { shift: true });

  if (selectedRowCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit">
      <div className="bg-background border-border flex items-center gap-2 rounded-lg border px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            {selectedRowCount} selected
          </span>
          <Tooltip>
            <TooltipTrigger
              delay={100}
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => table.resetRowSelection()}
                  className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 transition-colors"
                  aria-label="Deselect all"
                />
              }
            >
              <XIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                Deselect all <Kbd>⌘ ⇧ X</Kbd>
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-border mr-1 h-5 w-px" />
        <div className="flex items-center gap-2">
          {children({ rows: selectedRows, table })}
        </div>
      </div>
    </div>
  );
}
