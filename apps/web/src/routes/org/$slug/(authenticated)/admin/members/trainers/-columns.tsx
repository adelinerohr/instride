import type { types } from "@instride/api";
import { getUser } from "@instride/shared";
import { Link, useRouteContext } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/column-header";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { formatDate } from "@/shared/lib/utils/format";

export function getTrainersTableColumns(): ColumnDef<types.Trainer>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          className="translate-y-0.5"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsAllRowsSelected() ? true : false)
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          className="translate-y-0.5"
          checked={row.getIsSelected()}
          onCheckedChange={row.getToggleSelectedHandler()}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 40,
    },
    {
      id: "name",
      accessorKey: "name",
      accessorFn: (row) => getUser({ trainer: row }).name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      enableColumnFilter: true,
    },
    {
      id: "email",
      accessorKey: "email",
      accessorFn: (row) => getUser({ trainer: row }).email,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      enableColumnFilter: true,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Joined At" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const { organization } = useRouteContext({
          from: "/org/$slug/(authenticated)",
        });

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit">
              <DropdownMenuItem
                render={
                  <Link
                    to="/org/$slug/admin/members/trainers/$trainerId"
                    params={{
                      trainerId: row.original.id ?? "",
                      slug: organization.slug,
                    }}
                  />
                }
              >
                <EyeIcon />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
