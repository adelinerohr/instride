import { useRouteContext } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";

import { useIsMobile } from "@/shared/hooks/use-mobile";
import { getInitials } from "@/shared/lib/utils/format";

import { OrganizationLogo } from "../fragments/org-logo";
import { UserAvatar } from "../fragments/user-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarTrigger } from "../ui/sidebar";
import HeaderSearch from "./header-search";
import { UserDropdown } from "./user-dropdown";

interface AppHeaderProps {
  type: "admin" | "portal";
}

export function AppHeader({ type }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const { user, organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  if (isMobile) {
    return (
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 bg-background border-b">
        <div className="flex items-center gap-2">
          <OrganizationLogo organization={organization} size="sm" />
          <span className="font-display font-semibold text-sm truncate">
            {organization.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <HeaderSearch type={type} />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="ml-auto"
              render={<Button variant="ghost" size="lg" />}
            >
              <UserAvatar user={user} size="sm" />
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-(--anchor-width) w-fit"
            >
              <UserDropdown />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky z-50 top-0 flex h-16 shrink-0 items-center gap-4 border-b bg-sidebar px-4">
      <SidebarTrigger className="-ml-1" />
      <HeaderSearch type={type} />
      <DropdownMenu>
        <DropdownMenuTrigger
          className="ml-auto"
          render={<Button variant="ghost" size="lg" />}
        >
          <Avatar size="sm">
            <AvatarImage
              src={user.image ?? ""}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          {user.name}
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-(--anchor-width) w-fit"
        >
          <UserDropdown />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
