import { createFileRoute } from "@tanstack/react-router";
import { LockIcon, LockOpenIcon } from "lucide-react";

import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

import { PersonalDetails } from "./-details";
import { EmergencyContact } from "./-emergency";
import { SetPinDialog, setPinDialogHandler } from "./-pin";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/account/profile/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { member } = Route.useRouteContext();

  const hasKioskPin = member.kioskPin;

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Personal details"
        description="Set your name and contact information, the email address entered here is used for your login access."
      >
        <PersonalDetails />
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Kiosk PIN"
        description="To access the kiosk at your organization, you need to set a PIN."
      >
        <Item
          variant="outline"
          className={cn(!hasKioskPin && "border-destructive", "bg-card")}
        >
          <ItemMedia>
            {hasKioskPin ? (
              <LockIcon className="size-5" />
            ) : (
              <LockOpenIcon className="size-5" />
            )}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {hasKioskPin ? "Kiosk PIN set" : "Kiosk PIN not set"}
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <DialogTrigger render={<Button />} handle={setPinDialogHandler}>
              {hasKioskPin ? "Change PIN" : "Set PIN"}
            </DialogTrigger>
          </ItemActions>
        </Item>
      </AnnotatedSection>
      <Separator />
      {member.rider && (
        <AnnotatedSection
          title="Emergency contact"
          description="Set your emergency contact information."
        >
          <EmergencyContact />
        </AnnotatedSection>
      )}
      <SetPinDialog />
    </AnnotatedLayout>
  );
}
