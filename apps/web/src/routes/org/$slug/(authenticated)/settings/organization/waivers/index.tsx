import { useArchiveWaiver, waiverOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArchiveIcon,
  EllipsisVerticalIcon,
  FileIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";

import { waiverModalHandler } from "@/features/organization/components/waivers/waiver-modal";
import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { PageHeader } from "@/shared/components/layout/page";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/waivers/"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(
      waiverOptions.list(context.organization.id)
    );
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const confirmationModal = ConfirmationModal.useModal();
  const { data: waivers, isLoading } = useSuspenseQuery(
    waiverOptions.list(organization.id)
  );
  const archiveWaiver = useArchiveWaiver();

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader
          title="Waivers"
          description="Manage liability waivers that riders must sign."
          backButton={false}
          action={
            <DialogTrigger handle={waiverModalHandler} render={<Button />}>
              <PlusIcon />
              New waiver
            </DialogTrigger>
          }
        />

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="rounded-xl border border-border overflow-hidden animate-pulse">
              <div className="h-10 bg-muted/50" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 border-t border-border bg-muted/20"
                />
              ))}
            </div>
          ) : waivers.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileIcon />
                </EmptyMedia>
                <EmptyTitle>No waivers yet</EmptyTitle>
                <EmptyDescription>
                  Create liability waivers for riders to sign during onboarding.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <DialogTrigger handle={waiverModalHandler} render={<Button />}>
                  <PlusIcon />
                  New waiver
                </DialogTrigger>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Version
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {waivers.map((waiver) => (
                    <tr
                      key={waiver.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{waiver.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            waiver.status === "active" ? "default" : "outline"
                          }
                        >
                          {waiver.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        v{waiver.version}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <EllipsisVerticalIcon className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DialogTrigger
                              nativeButton={false}
                              handle={waiverModalHandler}
                              payload={{ waiver }}
                              render={<DropdownMenuItem />}
                            >
                              <PencilIcon />
                              Edit waiver
                            </DialogTrigger>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                confirmationModal.open({
                                  title: "Archive waiver?",
                                  description:
                                    "Archiving this waiver will prevent new signatures. Existing signatures will remain valid.",
                                  confirmLabel: "Archive waiver",
                                  cancelLabel: "Cancel",
                                  onConfirm: () =>
                                    archiveWaiver.mutateAsync(waiver.id),
                                })
                              }
                            >
                              <ArchiveIcon />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
