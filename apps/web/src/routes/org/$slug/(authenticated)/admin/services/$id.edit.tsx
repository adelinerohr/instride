import {
  boardsOptions,
  membersOptions,
  levelOptions,
  servicesOptions,
  useUpdateService,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { ServiceForm } from "@/features/organization/components/services/form";
import {
  buildServiceDefaultValues,
  serviceFormOpts,
} from "@/features/organization/lib/service.form";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/services/$id/edit"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(servicesOptions.byId(params.id));
    await context.queryClient.ensureQueryData(membersOptions.trainers());
    await context.queryClient.ensureQueryData(boardsOptions.list());
    await context.queryClient.ensureQueryData(levelOptions.list());
  },
});

function RouteComponent() {
  const updateService = useUpdateService();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const { id } = Route.useParams();

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const { data: levels } = useSuspenseQuery(levelOptions.list());
  const { data: service } = useSuspenseQuery(servicesOptions.byId(id));

  const form = useAppForm({
    ...serviceFormOpts,
    defaultValues: buildServiceDefaultValues(service),
    onSubmit: async ({ value }) => {
      console.log("Submitting service form: ", value);
      updateService.mutateAsync(
        {
          serviceId: id,
          request: {
            ...value,
            boardIds: value.boardIds.map((b) => b.id),
            trainerIds: value.trainerIds.map((t) => t.id),
          },
        },
        {
          onSuccess: () => {
            toast.success("Service updated successfully");
            navigate({
              to: "/org/$slug/admin/services",
            });
          },
          onError: () => {
            toast.error("Failed to update service");
          },
        }
      );
    },
  });

  return (
    <form
      className="relative flex h-full flex-col overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex items-center justify-between border-b px-2 py-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.history.back()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowLeftIcon />
          </Button>
          <h1 className="font-semibold text-2xl">Edit Service</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link className={buttonVariants({ variant: "outline" })} to="..">
            Cancel
          </Link>
          <form.AppForm>
            <form.SubmitButton label="Save" loadingLabel="Saving..." />
          </form.AppForm>
        </div>
      </div>
      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex max-w-6xl flex-col-reverse items-start gap-6 p-4 md:flex-row">
          <div className="flex w-full flex-1 flex-col gap-4">
            <ServiceForm
              form={form}
              trainers={trainers}
              levels={levels}
              boards={boards}
            />
          </div>
          <div className="flex w-full flex-col gap-1 rounded-md border border-primary bg-secondary px-4 py-2 text-secondary-foreground md:max-w-sm">
            <span className="font-semibold text-lg">About services</span>
            <p className="text-secondary-foreground/60">
              Services define the types of appointments that can be booked.
            </p>
          </div>
        </div>
      </ScrollArea>
    </form>
  );
}
