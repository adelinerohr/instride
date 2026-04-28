import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { getSettingsNavItems } from "@/shared/lib/navigation/settings";

export const Route = createFileRoute("/org/$slug/(authenticated)/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { organization, user, isAdmin, isTrainer } = Route.useRouteContext();
  const isMobile = useIsMobile();

  if (!isMobile) {
    throw Route.redirect({ to: "/org/$slug/settings/account/profile" });
  }

  const sections = getSettingsNavItems(organization.slug, isAdmin, isTrainer);
  console.log(sections);

  return (
    <div className="px-4 pb-20 space-y-4 pt-4">
      <Item variant="outline" className="bg-card">
        <ItemMedia>
          <UserAvatar user={user} size="lg" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{user.name}</ItemTitle>
          <ItemDescription>{user.email}</ItemDescription>
        </ItemContent>
      </Item>
      {sections.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {section.title}
          </h2>
          <div className="rounded-md border bg-card divide-y overflow-hidden">
            {section.links.map((link) => (
              <Item
                key={link.title}
                className="not-last:border-b not-last:border-border not-last:border-t-0 not-last:border-r-0 not-last:border-l-0 rounded-none"
                render={<Link {...link} />}
              >
                <ItemMedia variant="icon">
                  <link.icon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{link.title}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button variant="ghost" size="icon-sm">
                    <ChevronRightIcon />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
