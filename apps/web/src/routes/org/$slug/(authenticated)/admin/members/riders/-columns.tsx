import { type types } from "@instride/api";
import { getUser } from "@instride/utils";
import { Link, useRouteContext } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

import { editRiderModalHandler } from "@/features/organization/components/members/modals/edit-rider";
import { DataTableColumnHeader } from "@/shared/components/data-table/column-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { formatDate } from "@/shared/lib/utils/format";

interface GetRidersTableColumnsProps {
  levels: types.Level[];
  boards: types.Board[];
}

export function getRidersTableColumns({
  levels,
  boards,
}: GetRidersTableColumnsProps): ColumnDef<types.Rider>[] {
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
      accessorFn: (row) => getUser({ rider: row }).name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      enableColumnFilter: true,
    },
    {
      id: "email",
      accessorKey: "email",
      accessorFn: (row) => getUser({ rider: row }).email,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      enableColumnFilter: true,
    },
    {
      id: "level",
      accessorKey: "level",
      accessorFn: (row) => row.ridingLevelId,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Level" />
      ),
      cell: ({ row }) => {
        if (!row.original.level) {
          return (
            <span className="text-foreground/50 text-xs">Unrestricted</span>
          );
        } else {
          return (
            <Badge variant="outline">
              <CircleIcon
                stroke={row.original.level.color}
                fill={row.original.level.color}
              />
              {row.original.level.name}
            </Badge>
          );
        }
      },
      enableColumnFilter: true,
      meta: {
        label: "Levels",
        variant: "multiSelect",
        options: (levels ?? []).map((level) => ({
          label: level.name,
          value: level.id,
        })),
      },
    },
    {
      id: "boardIds",
      accessorKey: "boardIds",
      accessorFn: (row) =>
        (row.boardAssignments ?? []).map((assignment) => assignment.boardId),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Boards" />
      ),
      cell: ({ row }) => {
        if (row.original.boardAssignments?.length === 0) {
          return (
            <span className="text-foreground/50 text-xs">
              No boards assigned
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {row.original.boardAssignments?.map((assignment) => (
              <Badge key={assignment.boardId} variant="secondary">
                {assignment.board?.name}
              </Badge>
            ))}
          </div>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: "Boards",
        variant: "multiSelect",
        options: (boards ?? []).map((board) => ({
          label: board.name,
          value: board.id,
        })),
      },
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
                    to="/org/$slug/admin/members/riders/$riderId"
                    params={{
                      riderId: row.original.id ?? "",
                      slug: organization.slug,
                    }}
                  />
                }
              >
                <EyeIcon />
                View
              </DropdownMenuItem>
              <DialogTrigger
                nativeButton={false}
                handle={editRiderModalHandler}
                payload={{
                  rider: row.original,
                }}
                render={<DropdownMenuItem />}
              >
                <PencilIcon />
                Edit
              </DialogTrigger>
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
