import type { types } from "@instride/api";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  BanIcon,
  CheckIcon,
  ClockIcon,
  MoreHorizontalIcon,
  NotepadTextIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { DataTableColumnHeader } from "@/shared/components/data-table/column-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { authClient } from "@/shared/lib/auth/client";
import { cn } from "@/shared/lib/utils";
import { getInitials } from "@/shared/lib/utils/format";

const verificationStatuses = {
  verified: {
    label: "Verified",
    icon: <CheckIcon className="size-3.5" />,
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  pending: {
    label: "Pending",
    icon: <ClockIcon className="size-3.5" />,
    bgColor: "bg-yellow-100 dark:bg-yellow-900",
  },
};

function deleteUser(userId: string) {
  const queryClient = useQueryClient();
  toast.promise(
    async () => {
      const { error } = await authClient.admin.removeUser({ userId });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    {
      loading: "Deleting user...",
      success: "User deleted successfully",
      error: "Failed to delete user",
    }
  );
}

async function impersonateUser(userId: string, { name }: { name: string }) {
  const toastId = toast.loading(`Impersonating as ${name}...`);

  try {
    const { error } = await authClient.admin.impersonateUser({ userId });
    if (error) {
      throw error;
    }
    toast.dismiss(toastId);
    toast.success(`Now impersonating ${name}`);
    window.location.href = new URL("/", window.location.origin).toString();
  } catch (error) {
    console.error(error);
    toast.dismiss(toastId);
    toast.error("Failed to impersonate user");
  }
}

const resendVerificationMail = (email: string) => {
  toast.promise(
    async () => {
      const { error } = await authClient.sendVerificationEmail({ email });
      if (error) {
        throw error;
      }
    },
    {
      loading: "Sending verification email...",
      success: "Verification email sent.",
      error: "Failed to send verification email.",
    }
  );
};

async function assignAdminRole(userId: string) {
  const queryClient = useQueryClient();
  const { error } = await authClient.admin.setRole({ userId, role: "admin" });
  if (error) throw error;
  await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
}

async function removeAdminRole(userId: string) {
  const queryClient = useQueryClient();
  const { error } = await authClient.admin.setRole({ userId, role: "user" });
  if (error) throw error;
  await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
}

async function unbanUser(userId: string) {
  const queryClient = useQueryClient();
  toast.promise(
    async () => {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    {
      loading: "Unbanning user...",
      success: "User unbanned.",
      error: "Failed to unban user.",
    }
  );
}

export const usersTableColumns: ColumnDef<types.AuthUser>[] = [
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Name" />
    ),
    cell: ({ row }) => {
      <div className="flex items-center gap-2 py-2">
        <Avatar>
          <AvatarImage
            src={row.original.image ?? ""}
            alt={row.original.name ?? ""}
          />
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="font-medium text-muted-foreground">
          {row.original.name ?? "-"}
        </div>
      </div>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Email" />
    ),
    cell: ({ row }) => (
      <div className="text-foreground/80">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Role" />
    ),
    cell: ({ row }) => (
      <div className="text-foreground/80 capitalize">{row.original.role}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableColumnFilter: true,
    meta: {
      label: "Role",
      variant: "select",
      options: ["admin", "user"].map((role) => ({
        label: role.charAt(0).toUpperCase() + role.slice(1),
        value: role,
      })),
    },
  },
  {
    accessorKey: "emailVerified",
    enableSorting: false,
    header: () => (
      <div className="font-medium text-foreground text-xs">Email Status</div>
    ),
    cell: ({ row }) => {
      const status = row.original.emailVerified
        ? verificationStatuses.verified
        : verificationStatuses.pending;

      return (
        <Badge
          className={cn(
            "flex items-center justify-center gap-1.5 border-none px-2 py-0.5 font-medium text-foreground text-xs shadow-none",
            status.bgColor
          )}
          variant="outline"
        >
          {status.icon}
          <span>{status.label}</span>
        </Badge>
      );
    },
    filterFn: (row, _id, value) => {
      const verified = row.original.emailVerified;
      return value.includes(verified ? "verified" : "pending");
    },
    enableColumnFilter: true,
    meta: {
      label: "Email Status",
      variant: "select",
      options: ["verified", "pending"].map((status) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
    },
  },
  {
    accessorKey: "banned",
    enableSorting: false,
    header: () => (
      <div className="font-medium text-foreground text-xs">Account Status</div>
    ),
    cell: ({ row }) => {
      if (row.original.banned) {
        const banExpires = row.original.banExpires;
        const expiryText = banExpires
          ? ` until ${format(new Date(banExpires), "MMM d")}`
          : "";

        return (
          <Badge
            className="flex items-center justify-center gap-1.5 border-none bg-red-100 px-2 py-0.5 font-medium text-foreground text-xs shadow-none dark:bg-red-900"
            variant="outline"
          >
            <BanIcon className="size-3.5" />
            <span>Banned{expiryText}</span>
            {row.original.banReason && (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <NotepadTextIcon className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{row.original.banReason}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Badge>
        );
      }
      return (
        <Badge
          className="flex items-center justify-center gap-1.5 border-none bg-green-100 px-2 py-0.5 font-medium text-foreground text-xs shadow-none dark:bg-green-900"
          variant="outline"
        >
          <CheckIcon className="size-3.5" />
          <span>Active</span>
        </Badge>
      );
    },
    filterFn: (row, _id, value) => {
      const banned = row.original.banned;
      return value.includes(banned ? "banned" : "active");
    },
    enableColumnFilter: true,
    meta: {
      label: "Account Status",
      variant: "select",
      options: ["active", "banned"].map((status) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Created" />
    ),
    cell: ({ row }) => (
      <div className="text-foreground/80">
        {format(row.original.createdAt, "dd MMM, yyyy")}
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: "Created At",
      variant: "select",
      options: [
        { label: "Today", value: "today" },
        { label: "This Week", value: "this-week" },
        { label: "This Month", value: "this-month" },
        { label: "Older", value: "older" },
      ],
    },
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => {
      const confirmationModal = ConfirmationModal.useModal();
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                  variant="ghost"
                />
              }
            >
              <MoreHorizontalIcon className="shrink-0" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  impersonateUser(row.original.id, {
                    name: row.original.name ?? "",
                  })
                }
                disabled={row.original.role === "admin"}
                title={
                  row.original.role === "admin"
                    ? "Cannot impersonate other admins"
                    : undefined
                }
              >
                Impersonate
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={row.original.emailVerified}
                onClick={() => resendVerificationMail(row.original.email)}
              >
                Resend verification
              </DropdownMenuItem>
              {row.original.role !== "admin" ? (
                <DropdownMenuItem
                  onClick={() => assignAdminRole(row.original.id)}
                  disabled={row.original.banned ?? false}
                >
                  Make admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => removeAdminRole(row.original.id)}
                >
                  Remove admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {!(row.original.banned ?? false) ? (
                <DropdownMenuItem>Ban user</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => unbanUser(row.original.id)}>
                  Unban user
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  confirmationModal.open({
                    title: "Delete user?",
                    description:
                      "Are you sure you want to delete this user? This action cannot be undone.",
                    confirmLabel: "Delete",
                    onConfirm: () => deleteUser(row.original.id),
                  });
                }}
                variant="destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
