import { AlertTriangleIcon, LogOutIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";

import { useKiosk } from "../hooks/use-kiosk";
import { KioskScope } from "../lib/types";
import { actAsModalHandler } from "./act-as-modal";

export function ActingBanner() {
  const { acting, stopActing } = useKiosk();

  const isActing = acting.scope !== KioskScope.DEFAULT && acting.actingMemberId;

  const modeLabel =
    acting.scope === KioskScope.STAFF ? "Staff Mode" : "Self-Service";

  return (
    <div className="border-b bg-muted/50 px-4 py-3 text-center">
      {isActing ? (
        <Alert className="border-destructive bg-destructive/10 text-destructive">
          <AlertTriangleIcon />
          <AlertTitle>Kiosk Session Active - {modeLabel}</AlertTitle>
          <AlertDescription>
            Make sure to log out when you're done.
          </AlertDescription>
          <AlertAction>
            <Button onClick={stopActing} variant="destructive">
              <LogOutIcon />
              Log Out
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <DialogTrigger
          handle={actAsModalHandler}
          render={<Button variant="outline" />}
        >
          Select yourself to make changes
        </DialogTrigger>
      )}
    </div>
  );
}
