import { membersOptions } from "@instride/api";
import type { MemberWithUser } from "@instride/shared/interfaces";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Table } from "@tanstack/react-table";
import { CopyIcon } from "lucide-react";
import * as React from "react";

import { ChangeRoleModal } from "@/features/organization/components/members/modals/role-modal";
import { DataTable } from "@/shared/components/data-table";
import { DataTableActionBar } from "@/shared/components/data-table/action-bar";
import { DataTableToolbar } from "@/shared/components/data-table/toolbar";
import { DataTableSortList } from "@/shared/components/data-table/toolbar/sort-list";
import { Button } from "@/shared/components/ui/button";
import { useDataTable } from "@/shared/hooks/use-data-table";
import {
  resetPageOnFilterChange,
  tableSearchParams,
  validateFilterKeys,
  validateSortColumns,
} from "@/shared/lib/search/table";

import { getMembersTableColumns } from "./-columns";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/members/"
)({
  component: RouteComponent,
  validateSearch: tableSearchParams,
  search: {
    middlewares: [
      resetPageOnFilterChange(),
      validateSortColumns(["name", "role", "createdAt"]),
      validateFilterKeys(["role"]),
    ],
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membersOptions.all());
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const { data, isLoading } = useSuspenseQuery(membersOptions.all());

  const columns = React.useMemo(() => getMembersTableColumns(), []);
  const pageCount = React.useMemo(() => {
    return Math.ceil(data.length / search.perPage);
  }, [data, search.perPage]);

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
        actionBar={<MembersActionBar table={table} />}
      >
        <DataTableToolbar table={table} searchPlaceholder="Search members...">
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
      <ChangeRoleModal />
    </>
  );
}

function MembersActionBar({ table }: { table: Table<MemberWithUser> }) {
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
