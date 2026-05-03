import type { Column, Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

import { InputSearch } from "../../fragments/input-search";
import { DataTableDateFilter } from "./date-filter";
import { DataTableFacetedFilter } from "./faceted-filter";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  searchPlaceholder?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search records...",
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <InputSearch
          placeholder={searchPlaceholder}
          className="h-8 w-40 lg:w-56 bg-card"
          debounceTime={500}
          value={table.getState().globalFilter}
          onChange={(value) => table.setGlobalFilter(String(value))}
        />
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={onReset}
          >
            <XIcon />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
  fullWidth?: boolean;
}

export function DataTableToolbarFilter<TData>({
  column,
  fullWidth = false,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      const widthClass = fullWidth ? "w-full" : "h-8 w-40 lg:w-56";
      const numberWidthClass = fullWidth ? "w-full" : "h-8 w-[120px]";

      switch (columnMeta.variant) {
        case "text":
          return (
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className={widthClass}
            />
          );

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className={cn(numberWidthClass, columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === "multiSelect"}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}
