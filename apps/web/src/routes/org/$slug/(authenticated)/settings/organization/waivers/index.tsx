import { waiverOptions } from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EllipsisVerticalIcon, FileIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/shared/components/layout/page";
import { Badge } from "@/shared/components/ui/badge";
import { buttonVariants } from "@/shared/components/ui/button";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
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
      waiverOptions(context.organization.id).all()
    );
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const { data: waivers, isLoading } = useSuspenseQuery(
    waiverOptions(organization.id).all()
  );
  const [archivingId, setArchivingId] = React.useState<string | null>(null);

  const handleArchive = React.useCallback(async () => {
    if (!archivingId) return;
    try {
      // We don't have a delete endpoint, so we mark it as archived via update
      // In a real app this would call an archive endpoint
      toast.info("Archive functionality coming soon");
    } catch {
      toast.error("Failed to archive waiver");
    } finally {
      setArchivingId(null);
    }
  }, [archivingId]);

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader
          title="Waivers"
          description="Manage liability waivers that riders must sign."
          action={
            <Link
              to="/org/$slug/settings/organization/waivers/new"
              params={{ slug: organization.slug }}
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              <PlusIcon />
              New waiver
            </Link>
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
                <Link
                  to="/org/$slug/settings/organization/waivers/new"
                  params={{ slug: organization.slug }}
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  <PlusIcon />
                  New waiver
                </Link>
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
                      Required
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Guardian signature
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
                            <DropdownMenuItem>
                              <Link
                                to="/org/$slug/settings/organization/waivers/$waiverId/edit"
                                params={{
                                  slug: organization.slug,
                                  waiverId: waiver.id,
                                }}
                              >
                                Edit waiver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setArchivingId(waiver.id)}
                            >
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

      <Dialog
        open={!!archivingId}
        onOpenChange={(open) => !open && setArchivingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive waiver?</DialogTitle>
            <DialogDescription>
              Archiving this waiver will prevent new signatures. Existing
              signatures will remain valid.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchivingId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchive}>
              Archive waiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
