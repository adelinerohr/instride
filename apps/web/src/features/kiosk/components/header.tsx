import { KioskScope } from "@instride/shared";
import { Link, useRouteContext, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { LogOutIcon, UserIcon } from "lucide-react";
import * as React from "react";

import { OrganizationLogo } from "@/shared/components/fragments/org-logo";
import { Badge } from "@/shared/components/ui/badge";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";

import { useKiosk } from "../hooks/use-kiosk";
import { useExpiryCountdown } from "../hooks/use-kiosk-expiry";
import { actAsModalHandler } from "./modals/act-as-modal";

export function KioskHeader() {
  const { organization, kioskSession } = useRouteContext({
    from: "/org/$slug/(authenticated)/kiosk/$sessionId",
  });
  const { acting, stopActing } = useKiosk();
  const search = useSearch({
    from: "/org/$slug/(authenticated)/kiosk/$sessionId/calendar",
  });

  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const isAuthenticated = acting.scope !== KioskScope.DEFAULT;
  const countdown = useExpiryCountdown(acting.expiresAt);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
      {/* Left: kiosk context */}
      <div className="flex items-center gap-3">
        <OrganizationLogo organization={organization} />
        <div className="flex flex-col leading-tight">
          <span className="font-display font-semibold text-sm">
            {organization.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {kioskSession.locationName} &middot;{" "}
            {kioskSession.boardName ?? "All Boards"}
          </span>
        </div>
      </div>

      {/* Center: date & auth state */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="secondary">
              {acting.scope === KioskScope.STAFF
                ? "Staff Mode"
                : "Self-Service"}
            </Badge>
            {countdown && (
              <span className="text-muted-foreground tabular-nums">
                Signs out in {countdown}
              </span>
            )}
            <Link
              to="."
              search={(prev) => ({ ...prev, onlyMine: !search.onlyMine })}
              className={buttonVariants({
                variant: search.onlyMine ? "default" : "outline",
              })}
            >
              My Lessons
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{format(now, "EEEE, MMM d")}</span>
            <span className="text-muted-foreground">&middot;</span>
            <span className="text-muted-foreground">
              {format(now, "h:mm a")}
            </span>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <Button variant="outline" onClick={stopActing}>
            <LogOutIcon />
            Sign out
          </Button>
        ) : (
          <DialogTrigger
            handle={actAsModalHandler}
            render={<Button variant="outline" />}
          >
            <UserIcon />
            Sign in
          </DialogTrigger>
        )}
      </div>
    </header>
  );
}
