import { organizationOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

import { OrganizationLogo } from "@/shared/components/fragments/org-logo";
import { Button } from "@/shared/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";

export const Route = createFileRoute("/(authenticated)/join-organization")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(organizationOptions.all());
  },
});

function RouteComponent() {
  const { data: organizations } = useSuspenseQuery(organizationOptions.all());

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background relative">
      <div className="w-full max-w-lg gap-6 px-4 flex flex-col">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-display font-semibold tracking-tight">
            Join an organization
          </h1>
          <p className="text-sm text-muted-foreground">
            Select an organization to continue.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {organizations.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
              No organizations found.
            </div>
          ) : (
            organizations.map((organization) => (
              <Item
                variant="outline"
                className="bg-card"
                key={organization.id}
                render={
                  <Link to="/org/$slug" params={{ slug: organization.slug }} />
                }
              >
                <ItemMedia>
                  <OrganizationLogo size="lg" organization={organization} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{organization.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Go to organization"
                  >
                    <ChevronRightIcon />
                  </Button>
                </ItemActions>
              </Item>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
