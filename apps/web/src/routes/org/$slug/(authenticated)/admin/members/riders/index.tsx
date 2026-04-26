import {
  boardsOptions,
  levelOptions,
  membersOptions,
  type Rider,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Table } from "@tanstack/react-table";
import { CopyIcon } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/shared/components/data-table";
import { DataTableActionBar } from "@/shared/components/data-table/action-bar";
import { DataTableToolbar } from "@/shared/components/data-table/toolbar";
import { DataTableSortList } from "@/shared/components/data-table/toolbar/sort-list";
import { Button } from "@/shared/components/ui/button";
import { useDataTable } from "@/shared/hooks/use-data-table";

import { getRidersTableColumns } from "./-columns";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/riders/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membersOptions.riders());
    await context.queryClient.ensureQueryData(levelOptions.list());
    await context.queryClient.ensureQueryData(boardsOptions.list());
  },
});

function RouteComponent() {
  const { data, isLoading } = useSuspenseQuery(membersOptions.riders());
  const { data: levels } = useSuspenseQuery(levelOptions.list());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

  const columns = React.useMemo(
    () => getRidersTableColumns({ levels, boards }),
    []
  );
  const pageCount = React.useMemo(() => {
    return Math.ceil(data.length / 10);
  }, [data]);

  const table = useDataTable({
    data,
    columns,
    pageCount,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DataTable
        table={table}
        className="p-4"
        actionBar={<RidersActionBar table={table} />}
      >
        <DataTableToolbar table={table} searchPlaceholder="Search riders...">
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
    </>
  );
}

function RidersActionBar({ table }: { table: Table<Rider> }) {
  return (
    <DataTableActionBar table={table}>
      {({ rows }) => (
        <Button variant="outline" size="sm">
          <CopyIcon />
          Copy as JSON
        </Button>
      )}
    </DataTableActionBar>
  );
}
