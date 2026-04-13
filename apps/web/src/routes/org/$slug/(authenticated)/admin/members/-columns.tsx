import type { types } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { Link, useRouteContext } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserKeyIcon,
} from "lucide-react";

import { changeRoleModalHandler } from "@/features/organization/components/members/modals/role-modal";
import { DataTableColumnHeader } from "@/shared/components/data-table/column-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  formatDate,
  ROLE_LABELS,
  ROLE_VARIANTS,
} from "@/shared/lib/utils/format";

export function getMembersTableColumns(): ColumnDef<types.Member>[] {
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
      accessorFn: (row) => row.authUser?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      enableColumnFilter: true,
    },
    {
      id: "email",
      accessorKey: "email",
      accessorFn: (row) => row.authUser?.email,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      enableColumnFilter: true,
    },
    {
      id: "roles",
      accessorKey: "roles",
      accessorFn: (row) => row.roles,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Roles" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.roles.map((role) => (
            <Badge key={role} variant={ROLE_VARIANTS[role]}>
              {ROLE_LABELS[role]}
            </Badge>
          ))}
        </div>
      ),
      enableColumnFilter: true,
      filterFn: "arrIncludesSome",
      meta: {
        label: "Roles",
        variant: "multiSelect",
        options: Object.values(MembershipRole).map((role) => ({
          label: ROLE_LABELS[role],
          value: role,
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

        const rider = row.original.rider;
        const trainer = row.original.trainer;

        const isMemberRider = !!rider;
        const isMemberTrainer = !!trainer;

        const isBothRiderAndTrainer = isMemberRider && isMemberTrainer;

        const renderRiderActions = () => {
          return (
            <>
              <DropdownMenuItem
                render={
                  <Link
                    to="/org/$slug/admin/members/riders/$riderId"
                    params={{
                      riderId: rider?.id ?? "",
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
            </>
          );
        };

        const renderTrainerActions = () => {
          return (
            <>
              <DropdownMenuItem>
                <EyeIcon />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
            </>
          );
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit">
              {isBothRiderAndTrainer ? (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Rider Profile</DropdownMenuLabel>
                    {renderRiderActions()}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Trainer Profile</DropdownMenuLabel>
                    {renderTrainerActions()}
                  </DropdownMenuGroup>
                </>
              ) : isMemberRider ? (
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Rider Profile</DropdownMenuLabel>
                  {renderRiderActions()}
                </DropdownMenuGroup>
              ) : isMemberTrainer ? (
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Trainer Profile</DropdownMenuLabel>
                  {renderTrainerActions()}
                </DropdownMenuGroup>
              ) : null}
              <DropdownMenuSeparator />
              <DialogTrigger
                handle={changeRoleModalHandler}
                payload={{ member: row.original }}
                nativeButton={false}
                render={<DropdownMenuItem />}
              >
                <UserKeyIcon />
                Change role(s)
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
