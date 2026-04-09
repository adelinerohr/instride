import { useRouteContext, useRouter } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import {
  getAdminNavItems,
  getPortalNavItems,
} from "@/shared/lib/navigation/app";

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
import { Kbd } from "../ui/kbd";

type HeaderSearchProps = {
  type: "admin" | "portal";
};

export default function HeaderSearch({ type }: HeaderSearchProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const portalNavItems = getPortalNavItems(organization.slug);
  const adminNavItems = getAdminNavItems(organization.slug);

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
        <CommandItem key={item.title}>
          <item.icon />
          <span>{item.title}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );

  const renderAdminNavItems = () => (
    <>
      <CommandGroup heading="Main">
        {adminNavItems.main?.map((item) => (
          <CommandItem key={item.title}>
            {!!item.icon && <item.icon />}
            <span>{item.title}</span>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      {adminNavItems.groups?.map((route) => (
        <React.Fragment key={route.title}>
          <CommandGroup heading={route.title}>
            {route.links.map((item) =>
              "links" in item ? (
                item.links.map((link) => (
                  <CommandItem
                    key={link.title}
                    onSelect={() => {
                      setOpen(false);
                      router.navigate({ ...link });
                    }}
                  >
                    {!!item.icon && <item.icon />}
                    <span>{link.title}</span>
                  </CommandItem>
                ))
              ) : (
                <CommandItem
                  key={item.title}
                  onSelect={() => {
                    setOpen(false);
                    router.navigate({ ...item });
                  }}
                >
                  {!!item.icon && <item.icon />}
                  <span>{item.title}</span>
                </CommandItem>
              )
            )}
          </CommandGroup>
          <CommandSeparator />
        </React.Fragment>
      ))}
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
      <CommandDialog onOpenChange={setOpen} open={open}>
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
