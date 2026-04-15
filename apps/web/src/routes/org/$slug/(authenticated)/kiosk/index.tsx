import { kioskOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRightIcon, LaptopIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";

export const Route = createFileRoute("/org/$slug/(authenticated)/kiosk/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(kioskOptions.sessions());
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();

  const { data: sessions } = useSuspenseQuery(kioskOptions.sessions());

  if (sessions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Kiosk Sessions Available</CardTitle>
            <CardDescription>
              Contact your administrator to set up kiosk sessions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-64 justify-center p-6">
      <div className="w-full max-w-2xl space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Select Kiosk Session</h1>
          <p className="text-muted-foreground">
            Choose which kiosk you're using
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {sessions.map((session) => (
            <Item
              variant="outline"
              render={
                <Link
                  to="/org/$slug/kiosk/$sessionId/calendar"
                  params={{ slug, sessionId: session.id }}
                />
              }
            >
              <ItemMedia variant="icon">
                <LaptopIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {session.locationName}
                  <Badge variant="secondary">
                    {session.boardId ? session.boardName : "All Boards"}
                  </Badge>
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon-sm">
                  <ChevronRightIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      </div>
    </div>
  );
}
