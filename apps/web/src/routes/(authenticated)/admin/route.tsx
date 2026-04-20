import { adminOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import z from "zod";

import { DataTable } from "@/shared/components/data-table";
import { DataTableToolbar } from "@/shared/components/data-table/toolbar";
import { DataTableSortList } from "@/shared/components/data-table/toolbar/sort-list";
import { useDataTable } from "@/shared/hooks/use-data-table";

import { UsersActionBar } from "./-action-bar";
import { usersTableColumns } from "./-columns";

export const Route = createFileRoute("/(authenticated)/admin")({
  component: RouteComponent,
  validateSearch: z.object({
    query: z.string().optional().default(""),
    pageIndex: z.number().optional().default(0),
    pageSize: z.number().optional().default(25),
    role: z
      .array(z.enum(["admin", "user"]))
      .optional()
      .default([]),
    emailVerified: z
      .array(z.enum(["verified", "pending"]))
      .optional()
      .default([]),
    banned: z
      .array(z.enum(["active", "banned"]))
      .optional()
      .default([]),
    createdAt: z
      .array(z.enum(["today", "this-week", "this-month", "older"]))
      .optional()
      .default([]),
    sorting: z
      .object({
        id: z.string(),
        desc: z.boolean().optional().default(false),
      })
      .optional()
      .default({ id: "name", desc: false }),
  }),
  beforeLoad: async ({ context }) => {
    if (!context.user.role?.includes("admin")) {
      throw Route.redirect({ to: "/" });
    }
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      adminOptions.users({
        query: deps.search.query || "",
        limit: deps.search.pageSize || 25,
        sortBy: deps.search.sorting.id || "name",
        sortOrder: deps.search.sorting.desc ? "desc" : "asc",
        offset: (deps.search.pageIndex || 0) * (deps.search.pageSize || 25),
        role: deps.search.role || [],
        emailVerified: deps.search.emailVerified || [],
        banned: deps.search.banned || [],
        createdAt: deps.search.createdAt || [],
      })
    );
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const { data, isPending } = useSuspenseQuery(
    adminOptions.users({
      query: search.query || "",
      limit: search.pageSize || 25,
      sortBy: search.sorting.id || "name",
      sortOrder: search.sorting.desc ? "desc" : "asc",
      offset: (search.pageIndex || 0) * (search.pageSize || 25),
      role: search.role || [],
      emailVerified: search.emailVerified || [],
      banned: search.banned || [],
      createdAt: search.createdAt || [],
    })
  );

  const columns = React.useMemo(() => usersTableColumns, []);
  const pageCount = React.useMemo(() => {
    return Math.ceil(data.total / search.pageSize);
  }, [data.total, search.pageSize]);

  const table = useDataTable({
    data: data.users,
    columns,
    pageCount,
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <DataTable
      table={table}
      className="p-4"
      actionBar={<UsersActionBar table={table} />}
    >
      <DataTableToolbar table={table} searchPlaceholder="Search users...">
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}
