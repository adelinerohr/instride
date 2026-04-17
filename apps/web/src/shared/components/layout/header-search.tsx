import { getUser, useBoards, useMembers, useServices } from "@instride/api";
import { ROLE_LABELS, ROLE_VARIANTS } from "@instride/shared";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import { getPortalNavItems } from "@/shared/lib/navigation/app";

import { UserAvatar } from "../fragments/user-avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from "../ui/item";
import { Kbd } from "../ui/kbd";
import { Skeleton } from "../ui/skeleton";

type HeaderSearchProps = {
  type: "admin" | "portal";
};

export default function HeaderSearch({ type }: HeaderSearchProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const { data: members, isPending: isPendingMembers } = useMembers();
  const { data: boards, isPending: isPendingBoards } = useBoards();
  const { data: services, isPending: isPendingServices } = useServices();

  const portalNavItems = getPortalNavItems(organization.slug);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const renderPortalNavItems = () => (
    <CommandGroup>
      {portalNavItems.map((item) => (
        <CommandItem key={item.title} disableCheck>
          <item.icon />
          <span>{item.title}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );

  const renderBoardGroup = () =>
    boards && (
      <CommandGroup heading="Boards">
        {boards.map((board) => (
          <CommandItem key={board.id} disableCheck>
            <span>{board.name}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    );

  const renderServiceGroup = () =>
    services && (
      <CommandGroup heading="Services">
        {services.map((service) => {
          const boardIds = (service.boardAssignments ?? []).map(
            (a) => a.boardId
          );
          const boardNames = (boards ?? [])
            .filter((b) => boardIds.includes(b.id))
            .map((b) => b.name);
          return (
            <CommandItem key={service.id} disableCheck>
              <span>{service.name}</span>
              <div className="ml-auto flex items-center gap-2">
                {boardNames.map((name) => (
                  <Badge key={name} variant="outline">
                    {name}
                  </Badge>
                ))}
              </div>
            </CommandItem>
          );
        })}
      </CommandGroup>
    );

  const renderMemberGroup = () =>
    members && (
      <CommandGroup heading="Members">
        {isPendingMembers ? (
          <CommandItem>
            <Skeleton className="w-full h-4" />
          </CommandItem>
        ) : (
          members.map((member) => {
            const user = getUser({ member });
            return (
              <CommandItem key={member.id} disableCheck>
                <Item size="xs" className="p-0">
                  <ItemMedia>
                    <UserAvatar user={user} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions className="pr-0">
                    {member.roles.map((role) => (
                      <Badge
                        key={`${member.id}-${role}`}
                        variant={ROLE_VARIANTS[role]}
                      >
                        {ROLE_LABELS[role]}
                      </Badge>
                    ))}
                  </ItemActions>
                </Item>
              </CommandItem>
            );
          })
        )}
      </CommandGroup>
    );

  const renderAdminNavItems = () => (
    <>
      {renderMemberGroup()}
      <CommandSeparator />
      {renderBoardGroup()}
      <CommandSeparator />
      {renderServiceGroup()}
    </>
  );

  return (
    <div className="lg:flex-1">
      <div className="relative hidden max-w-sm flex-1 lg:block">
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="font-normal min-w-2xs"
        >
          <SearchIcon />
          <span className="flex-1 text-left">Search...</span>
          <Kbd>⌘ K</Kbd>
        </Button>
      </div>
      <div className="block lg:hidden">
        <Button onClick={() => setOpen(true)} size="icon" variant="ghost">
          <SearchIcon />
        </Button>
      </div>
      <CommandDialog onOpenChange={setOpen} open={open} className="max-w-lg!">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {type === "portal" ? renderPortalNavItems() : renderAdminNavItems()}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
