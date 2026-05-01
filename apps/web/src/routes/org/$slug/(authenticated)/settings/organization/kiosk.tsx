import {
  APIError,
  boardsOptions,
  kioskOptions,
  useCreateKioskSession,
  useDeleteKioskSession,
  useUpdateKioskSession,
  type KioskSession,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ComputerIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useAppForm } from "@/shared/hooks/use-form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/kiosk"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(kioskOptions.sessions());
    await context.queryClient.ensureQueryData(boardsOptions.list());
  },
});

function RouteComponent() {
  const { data: sessions } = useSuspenseQuery(kioskOptions.sessions());
  const confirmationModal = ConfirmationModal.useModal();

  const deleteSession = useDeleteKioskSession();

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Kiosk sessions"
        description="Manage the kiosk sessions for your organization."
      >
        <Card>
          <CardHeader>
            <CardTitle>Kiosk sessions</CardTitle>
            <CardDescription>
              Create persistent kiosk sessions for different locations.
            </CardDescription>
            <CardAction>
              <DialogTrigger handle={kioskSessionHandler} render={<Button />}>
                <PlusIcon />
                Add session
              </DialogTrigger>
            </CardAction>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ComputerIcon />
                  </EmptyMedia>
                  <EmptyTitle>No kiosk sessions</EmptyTitle>
                  <EmptyDescription>
                    Create a kiosk session to get started.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Board Filter</TableHead>
                    <TableHead>Active User</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.locationName}
                      </TableCell>
                      <TableCell>{session.boardName}</TableCell>
                      <TableCell>
                        {session.currentlyActing ? (
                          <Badge variant="outline">{session.scope}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="flex item-center justify-end gap-2">
                        <DialogTrigger
                          handle={kioskSessionHandler}
                          payload={{ session }}
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <PencilIcon />
                        </DialogTrigger>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            confirmationModal.open({
                              title: `Delete Kiosk: ${session.locationName}`,
                              description:
                                "Are you sure you want to delete this session? This action cannot be undone.",
                              confirmLabel: "Delete",
                              cancelLabel: "Cancel",
                              onConfirm: () => {
                                deleteSession.mutateAsync(session.id, {
                                  onSuccess: () => {
                                    toast.success(
                                      "Session deleted successfully"
                                    );
                                    confirmationModal.close();
                                  },
                                  onError: (error) => {
                                    toast.error(
                                      error instanceof APIError
                                        ? error.message
                                        : "Failed to delete session"
                                    );
                                  },
                                });
                              },
                            });
                          }}
                        >
                          <TrashIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </AnnotatedSection>
      <KioskSessionDialog />
    </AnnotatedLayout>
  );
}

interface KioskSessionDialogPayload {
  session?: KioskSession;
}
export const kioskSessionHandler =
  DialogHandler.createHandle<KioskSessionDialogPayload | null>();

const KioskSessionDialog = () => {
  return (
    <Dialog handle={kioskSessionHandler}>
      {({ payload }) => (
        <DialogPortal>
          <KioskSessionForm session={payload?.session ?? undefined} />
        </DialogPortal>
      )}
    </Dialog>
  );
};

function KioskSessionForm({ session }: KioskSessionDialogPayload) {
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

  const createSession = useCreateKioskSession();
  const updateSession = useUpdateKioskSession();

  const form = useAppForm({
    defaultValues: {
      locationName: session?.locationName ?? "",
      boardId: session?.boardId ?? null,
    },
    validators: {
      onSubmit: z.object({
        locationName: z.string().min(1, "Location name is required"),
        boardId: z.string().nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      if (session) {
        await updateSession.mutateAsync(
          {
            sessionId: session.id,
            locationName: value.locationName,
            boardId: value.boardId,
          },
          {
            onSuccess: () => {
              toast.success("Session updated successfully");
              kioskSessionHandler.close();
            },
            onError: (error) => {
              toast.error(
                error instanceof APIError
                  ? error.message
                  : "Failed to update session"
              );
            },
          }
        );
      } else {
        await createSession.mutateAsync(value, {
          onSuccess: () => {
            toast.success("Session created successfully");
            kioskSessionHandler.close();
          },
          onError: (error) => {
            toast.error(
              error instanceof APIError
                ? error.message
                : "Failed to create session"
            );
          },
        });
      }
    },
  });

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle>Create Kiosk Session</DialogTitle>
          <DialogDescription>
            Set up a new kiosk location for member self-service.
          </DialogDescription>
        </DialogHeader>
        <form.AppField
          name="locationName"
          children={(field) => (
            <field.TextField
              label="Location name"
              placeholder="e.g. Front Desk"
            />
          )}
        />
        <form.AppField
          name="boardId"
          children={(field) => (
            <field.ClearableSelectField
              label="Board filter (optional)"
              placeholder="All boards"
              items={boards}
              itemToValue={(board) => board?.id ?? null}
              renderValue={(board) => board?.name ?? "All boards"}
            />
          )}
        />
        <DialogFooter>
          <form.AppForm>
            <form.SubmitButton label="Create" loadingLabel="Creating..." />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
