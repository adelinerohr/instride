"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

// ---- Context ------------------------------------------------------------
// Only used to coordinate Content/Header/Footer/etc. with the Root's choice.
// Triggers (and anything called imperatively) read useIsMobile() directly.

type DialogContextValue = { isMobile: boolean };
const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  // Fall back to runtime check so subcomponents rendered outside a Root
  // (rare, but possible) still behave correctly.
  const ctx = React.useContext(DialogContext);
  const runtimeIsMobile = useIsMobile();
  return ctx ?? { isMobile: runtimeIsMobile };
}

// ---- Root ---------------------------------------------------------------

function Dialog<Payload = unknown>({
  ...props
}: DialogPrimitive.Root.Props<Payload>) {
  const isMobile = useIsMobile();

  return (
    <DialogContext.Provider value={{ isMobile }}>
      {isMobile ? (
        <Sheet data-slot="dialog" {...props} />
      ) : (
        <DialogPrimitive.Root data-slot="dialog" {...props} />
      )}
    </DialogContext.Provider>
  );
}

// ---- Trigger ------------------------------------------------------------
// Reads viewport directly — works whether rendered inside <Dialog> or via
// a detached handle (e.g. changeRoleModalHandler.openWithPayload()).

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <SheetTrigger data-slot="dialog-trigger" {...props} />;
  }
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <SheetClose data-slot="dialog-close" {...props} />;
  }
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  // Sheet owns its own portal; on mobile this is a passthrough.
  const { isMobile } = useDialogContext();
  if (isMobile) return <>{props.children}</>;
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  const { isMobile } = useDialogContext();
  if (isMobile) return null;

  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

// ---- Content ------------------------------------------------------------

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  const { isMobile } = useDialogContext();

  if (isMobile) {
    return (
      <SheetContent
        data-slot="dialog-content"
        side="bottom"
        showCloseButton={showCloseButton}
        className={cn("rounded-t-xl", className)}
        {...(props as React.ComponentProps<typeof SheetContent>)}
      >
        {children}
      </SheetContent>
    );
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

// ---- Header / Footer / Title / Description -----------------------------

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useDialogContext();
  if (isMobile) {
    return (
      <SheetHeader data-slot="dialog-header" className={className} {...props} />
    );
  }
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  const { isMobile } = useDialogContext();

  if (isMobile) {
    return (
      <SheetFooter data-slot="dialog-footer" className={className} {...props}>
        {children}
        {showCloseButton && (
          <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
        )}
      </SheetFooter>
    );
  }

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  const { isMobile } = useDialogContext();
  if (isMobile) {
    return (
      <SheetTitle data-slot="dialog-title" className={className} {...props} />
    );
  }
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  const { isMobile } = useDialogContext();
  if (isMobile) {
    return (
      <SheetDescription
        data-slot="dialog-description"
        className={className}
        {...props}
      />
    );
  }
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  DialogPrimitive as DialogHandler,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
