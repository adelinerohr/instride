import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export interface Column<TData> {
  id: string;
  header: React.ReactNode;
  cell: (row: TData) => React.ReactNode;
  className?: string;
  /** Pass a sort key to make the column header clickable */
  sortKey?: string;
}

interface DataTableProps<TData> {
  columns: Column<TData>[];
  rows: TData[];
  rowKey: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  sort?: { by: string; dir: "asc" | "desc" };
  onSortChange?: (by: string) => void;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
  emptyState,
  isLoading,
}: DataTableProps<TData>) {
  if (rows.length === 0 && !isLoading) {
    return emptyState;
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  column.sortKey && "cursor-pointer select-none",
                  column.className
                )}
                onClick={
                  column.sortKey
                    ? () => onSortChange?.(column.sortKey!)
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {column.header}
                  {column.sortKey && sort?.by === column.sortKey && (
                    <>
                      {sort.dir === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </>
                  )}
                </span>
              </TableHead>
            ))}
            {onRowClick && <TableHead aria-hidden className="w-8" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <TableCell key={column.id} className={cn(column.className)}>
                  {column.cell(row)}
                </TableCell>
              ))}
              {onRowClick && (
                <TableCell className="pr-3">
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
