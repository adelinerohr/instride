import { rankItem } from "@tanstack/match-sorter-utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import * as TT from "@tanstack/react-table";
import * as React from "react";

import type { ExtendedColumnSort } from "../lib/types/data-table";

interface UseDataTableProps<TData>
  extends
    Omit<
      TT.TableOptions<TData>,
      | "state"
      | "pageCount"
      | "getCoreRowModel"
      | "manualFiltering"
      | "manualPagination"
      | "manualSorting"
    >,
    Required<Pick<TT.TableOptions<TData>, "pageCount">> {
  initialState?: Omit<Partial<TT.TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[];
  };
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const page = search.page ?? 1;
  const perPage = search.perPage ?? 10;
  const sort = search.sort ?? [{ id: "createdAt", desc: true }];
  const filterValues = search.filters ?? {};

  const { columns, pageCount = -1, initialState, ...tableProps } = props;

  const [rowSelection, setRowSelection] = React.useState<TT.RowSelectionState>(
    initialState?.rowSelection ?? {}
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<TT.VisibilityState>(initialState?.columnVisibility ?? {});

  const setPage = React.useCallback(
    (page: number) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          page,
        }),
      });
    },
    [navigate, search]
  );

  const setPerPage = React.useCallback(
    (perPage: number) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          perPage,
        }),
      });
    },
    [navigate, search]
  );

  const pagination: TT.PaginationState = React.useMemo(() => {
    return {
      pageIndex: page - 1, // zero-based index -> one-based index
      pageSize: perPage,
    };
  }, [page, perPage]);

  const onPaginationChange = React.useCallback(
    (updaterOrValue: TT.Updater<TT.PaginationState>) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      void setPage(newPagination.pageIndex + 1);
      void setPerPage(newPagination.pageSize);
    },
    [pagination, setPage, setPerPage]
  );

  const setSort = React.useCallback(
    (sort: ExtendedColumnSort<TData>[]) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          sort,
        }),
      });
    },
    [navigate, sort]
  );

  const onSortingChange = React.useCallback(
    (updaterOrValue: TT.Updater<TT.SortingState>) => {
      const newSort =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sort)
          : updaterOrValue;
      setSort(newSort as ExtendedColumnSort<TData>[]);
    },
    [sort, setSort]
  );

  const filterableColumns = React.useMemo(() => {
    return columns.filter((column) => column.enableColumnFilter);
  }, [columns]);

  const setFilterValues = React.useCallback(
    (values: Record<string, string | string[] | null>) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          filters: values,
        }),
      });
    },
    [navigate, search]
  );

  const columnFilters: TT.ColumnFiltersState = React.useMemo(() => {
    if (!filterValues) return [];
    return Object.entries(filterValues).reduce<TT.ColumnFiltersState>(
      (filters, [key, value]) => {
        if (value !== null) {
          filters.push({
            id: key,
            value: Array.isArray(value) ? value : [value],
          });
        }
        return filters;
      },
      []
    );
  }, [filterValues]);

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: TT.Updater<TT.ColumnFiltersState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue;

      const filterUpdates = next.reduce<
        Record<string, string | string[] | null>
      >((acc, filter) => {
        if (filterableColumns.find((column) => column.id === filter.id)) {
          acc[filter.id] = filter.value as string | string[];
        }
        return acc;
      }, {});

      for (const prevFilter of columnFilters) {
        if (!next.some((filter) => filter.id === prevFilter.id)) {
          filterUpdates[prevFilter.id] = null;
        }
      }

      setFilterValues(filterUpdates);
    },
    [columnFilters, setFilterValues, filterableColumns]
  );

  const [globalFilter, setGlobalFilter] = React.useState("");

  const fuzzyFilter: TT.FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };

  const table = TT.useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      globalFilter,
      pagination,
      sorting: sort,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: TT.getCoreRowModel(),
    getFilteredRowModel: TT.getFilteredRowModel(),
    getPaginationRowModel: TT.getPaginationRowModel(),
    getSortedRowModel: TT.getSortedRowModel(),
    getFacetedRowModel: TT.getFacetedRowModel(),
    getFacetedUniqueValues: TT.getFacetedUniqueValues(),
    getFacetedMinMaxValues: TT.getFacetedMinMaxValues(),
    meta: {
      ...tableProps.meta,
    },
  });

  return React.useMemo(() => table, [table]);
}
