import { waiverOptions, useUpdateWaiver } from "@instride/api";
import { waiverInputSchema } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/shared/components/layout/page";
import { Button } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/waivers/$waiverId/edit"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return await context.queryClient.ensureQueryData(
      waiverOptions(context.organization.id).byId(params.waiverId)
    );
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const { waiverId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { data: waiver, isLoading } = useSuspenseQuery(
    waiverOptions(organization.id).byId(waiverId)
  );
  const updateWaiver = useUpdateWaiver();

  const form = useAppForm({
    defaultValues: {
      title: waiver?.title ?? "",
      content: waiver?.content ?? "",
    },
    validators: { onSubmit: waiverInputSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateWaiver.mutateAsync({
          waiverId,
          request: { title: value.title, content: value.content },
        });
        toast.success("Waiver updated");
        navigate({
          to: "/org/$slug/settings/organization/waivers",
          params: { slug: organization.slug },
        });
      } catch {
        toast.error("Failed to update waiver");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    );
  }

  if (!waiver) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Waiver not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={`Edit "${waiver.title}"`}
        description={`Version ${waiver.version} · Editing creates a new version`}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate({
                to: "/org/$slug/settings/organization/waivers",
                params: { slug: organization.slug },
              })
            }
          >
            <ArrowLeftIcon className="size-4" />
            Waivers
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <FieldGroup>
              <form.AppField
                name="title"
                children={(field) => <field.TextField label="Title" />}
              />
              <form.AppField
                name="content"
                children={(field) => (
                  <field.TextareaField label="Waiver content" rows={10} />
                )}
              />
            </FieldGroup>

            <form.AppForm>
              <form.SubmitButton label="Save changes" loadingLabel="Saving…" />
            </form.AppForm>
          </form>
        </div>
      </div>
    </div>
  );
}
