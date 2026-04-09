import {
  boardsOptions,
  membersOptions,
  useCreateService,
  levelOptions,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { ServiceForm } from "@/features/organization/components/services/form";
import { serviceFormOpts } from "@/features/organization/lib/service.form";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/services/new"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(membersOptions.trainers());
    await context.queryClient.ensureQueryData(boardsOptions.list());
    await context.queryClient.ensureQueryData(levelOptions.list());
  },
});

function RouteComponent() {
  const createService = useCreateService();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { data: trainers } = useSuspenseQuery(membersOptions.trainers());
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const { data: levels } = useSuspenseQuery(levelOptions.list());

  const form = useAppForm({
    ...serviceFormOpts,
    onSubmit: async ({ value }) => {
      console.log("Submitting board form: ", value);
      createService.mutateAsync(
        { value },
        {
          onSuccess: () => {
            toast.success("Board created successfully");
            navigate({
              to: "/org/$slug/admin/boards",
            });
          },
          onError: () => {
            toast.error("Failed to create board");
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
          <h1 className="font-semibold text-2xl">Create New Board</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link className={buttonVariants({ variant: "outline" })} to="..">
            Cancel
          </Link>
          <form.AppForm>
            <form.SubmitButton label="Add" loadingLabel="Adding..." />
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
