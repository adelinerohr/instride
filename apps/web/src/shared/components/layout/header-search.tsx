import {
  getUser,
  useBoards,
  useRiders,
  useServices,
  useTrainers,
} from "@instride/api";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import { BoardBadge } from "@/features/organization/components/fragments/badges";
import { getPortalNavItems } from "@/shared/lib/navigation/app";

import { UserAvatar } from "../fragments/user-avatar";
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
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
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

  const { data: trainers, isPending: isPendingTrainers } = useTrainers();
  const { data: riders, isPending: isPendingRiders } = useRiders();
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
        {isPendingBoards ? (
          <CommandItem>
            <Skeleton className="w-full h-4" />
          </CommandItem>
        ) : (
          boards.map((board) => (
            <CommandItem
              key={board.id}
              disableCheck
              keywords={[board.name]}
              value={board.id}
              onSelect={() => {
                router.navigate({
                  to: "/org/$slug/admin/boards/$id",
                  params: { slug: organization.slug, id: board.id },
                });
                setOpen(false);
              }}
            >
              <span>{board.name}</span>
            </CommandItem>
          ))
        )}
      </CommandGroup>
    );

  const renderServiceGroup = () =>
    services && (
      <CommandGroup heading="Services">
        {isPendingServices ? (
          <CommandItem>
            <Skeleton className="w-full h-4" />
          </CommandItem>
        ) : (
          services.map((service) => {
            const serviceBoards = boards?.filter((b) =>
              service.boardAssignments?.some((a) => a.boardId === b.id)
            );
            return (
              <CommandItem
                key={service.id}
                disableCheck
                keywords={[
                  service.name,
                  ...(serviceBoards?.map((b) => b.name) ?? []),
                ]}
                value={service.id}
                onSelect={() => {
                  router.navigate({
                    to: "/org/$slug/admin/services/$id",
                    params: { slug: organization.slug, id: service.id },
                  });
                  setOpen(false);
                }}
              >
                <span>{service.name}</span>
                <div className="ml-auto flex items-center gap-2">
                  {serviceBoards?.map((board) => (
                    <BoardBadge key={board.id} board={board} />
                  ))}
                </div>
              </CommandItem>
            );
          })
        )}
      </CommandGroup>
    );

  const renderTrainerGroup = () =>
    trainers && (
      <CommandGroup heading="Trainers">
        {isPendingTrainers ? (
          <CommandItem>
            <Skeleton className="w-full h-4" />
          </CommandItem>
        ) : (
          trainers.map((trainer) => {
            const user = getUser({ trainer });
            return (
              <CommandItem
                key={trainer.id}
                disableCheck
                value={trainer.id}
                keywords={[
                  user.name,
                  ...(trainer.boardAssignments?.map(
                    (assignment) => assignment.board.name
                  ) ?? []),
                ]}
                onSelect={() => {
                  router.navigate({
                    to: "/org/$slug/admin/members/trainers/$trainerId",
                    params: { slug: organization.slug, trainerId: trainer.id },
                  });
                  setOpen(false);
                }}
              >
                <Item size="xs" className="p-0">
                  <ItemMedia>
                    <UserAvatar size="xs" user={user} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    {trainer.boardAssignments.map((assignment) => (
                      <BoardBadge
                        key={assignment.boardId}
                        board={assignment.board}
                      />
                    ))}
                  </ItemActions>
                </Item>
              </CommandItem>
            );
          })
        )}
      </CommandGroup>
    );

  const renderRiderGroup = () =>
    riders && (
      <CommandGroup heading="Riders">
        {isPendingRiders ? (
          <CommandItem>
            <Skeleton className="w-full h-4" />
          </CommandItem>
        ) : (
          riders.map((rider) => {
            const user = getUser({ rider });
            return (
              <CommandItem
                key={rider.id}
                disableCheck
                value={rider.id}
                keywords={[
                  user.name,
                  rider.level?.name ?? "Unrestricted",
                  ...(rider.boardAssignments?.map(
                    (assignment) => assignment.board.name
                  ) ?? []),
                ]}
                onSelect={() => {
                  router.navigate({
                    to: "/org/$slug/admin/members/riders/$riderId",
                    params: { slug: organization.slug, riderId: rider.id },
                  });
                  setOpen(false);
                }}
              >
                <Item size="xs" className="p-0">
                  <ItemMedia>
                    <UserAvatar size="xs" user={user} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    {rider.boardAssignments.map((assignment) => (
                      <BoardBadge
                        key={assignment.boardId}
                        board={assignment.board}
                      />
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
      {renderTrainerGroup()}
      <CommandSeparator />
      {renderRiderGroup()}
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
