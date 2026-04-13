import {
  useUpdateBoard,
  boardsOptions,
  membersOptions,
  servicesOptions,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { BoardForm } from "@/features/organization/components/boards/form";
import {
  boardFormOpts,
  buildBoardDefaultValues,
} from "@/features/organization/lib/board.form";
import { Page, PageHeader } from "@/shared/components/layout/page";
import { buttonVariants } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/boards/$id/edit"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(boardsOptions.byId(params.id));
    await context.queryClient.ensureQueryData(membersOptions.trainers());
    await context.queryClient.ensureQueryData(servicesOptions.all());
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: board } = useSuspenseQuery(boardsOptions.byId(id));
  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: services } = useSuspenseQuery(servicesOptions.all());

  const updateBoard = useUpdateBoard();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    ...boardFormOpts,
    defaultValues: buildBoardDefaultValues(board),
    onSubmit: async ({ value }) => {
      updateBoard.mutateAsync(
        {
          boardId: board.id,
          request: {
            name: value.name,
            canRiderAdd: false,
            trainerIds: value.trainerIds.map((t) => t.id),
            serviceIds: value.serviceIds.map((s) => s.id),
          },
        },
        {
          onSuccess: () => {
            toast.success("Board updated successfully");
            navigate({
              to: "/org/$slug/admin/boards",
            });
          },
          onError: () => {
            toast.error("Failed to update board");
          },
        }
      );
    },
  });

  return (
    <Page>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <PageHeader title="Edit Board">
          <div className="flex items-center gap-2">
            <Link className={buttonVariants({ variant: "outline" })} to="..">
              Cancel
            </Link>
            <form.AppForm>
              <form.SubmitButton label="Save" loadingLabel="Saving..." />
            </form.AppForm>
          </div>
        </PageHeader>
        <ScrollArea className="min-h-0 w-full flex-1">
          <div className="flex max-w-6xl flex-col-reverse items-start gap-6 p-4 md:flex-row">
            <div className="flex w-full flex-1 flex-col gap-4">
              <BoardForm form={form} trainers={trainers} services={services} />
            </div>
            <div className="flex w-full flex-col gap-1 rounded-md border border-primary bg-secondary px-4 py-2 text-secondary-foreground md:max-w-sm">
              <span className="font-semibold text-lg">About boards</span>
              <p className="text-secondary-foreground/60">
                Boards help you keep your schedule organized. You can create
                boards for specific appointment types, space rentals, etc.
              </p>
            </div>
          </div>
        </ScrollArea>
      </form>
    </Page>
  );
}
