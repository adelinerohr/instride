import { MembershipRole } from "@instride/shared";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import {
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UserCog2Icon,
  UserIcon,
} from "lucide-react";

import { authClient } from "@/shared/lib/auth/client";
import { hasAnyRole, hasRole } from "@/shared/lib/auth/roles";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";

export function UserDropdown() {
  const navigate = useNavigate();
  const { user, organization, member, isPortal } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const isAdminOrTrainer = hasAnyRole(member, [
    MembershipRole.ADMIN,
    MembershipRole.TRAINER,
  ]);
  const isRider = hasRole(member, MembershipRole.RIDER);

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/org/$slug/login", params: { slug: organization.slug } });
  };

  return (
    <>
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <Avatar size="lg">
          <AvatarImage alt={user.name} src={user.image ?? ""} />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        render={
          <Link to="/org/$slug/admin" params={{ slug: organization.slug }} />
        }
      >
        <UserCog2Icon />
        Account Settings
      </DropdownMenuItem>
      {isAdminOrTrainer && (
        <DropdownMenuItem
          render={
            <Link
              to="/org/$slug/settings/organization/general"
              params={{ slug: organization.slug }}
            />
          }
        >
          <SettingsIcon />
          Organization Settings
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      {isRider && !isPortal && (
        <DropdownMenuItem
          render={
            <Link to="/org/$slug/portal" params={{ slug: organization.slug }} />
          }
        >
          <UserIcon />
          Rider Dashboard
        </DropdownMenuItem>
      )}

      {isAdminOrTrainer && isPortal && (
        <DropdownMenuItem
          render={
            <Link to="/org/$slug/admin" params={{ slug: organization.slug }} />
          }
        >
          <LayoutDashboardIcon />
          Admin Dashboard
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleSignOut}>
        <LogOutIcon />
        Sign Out
      </DropdownMenuItem>
    </>
  );
}
