import { useCreateWaiver } from "@instride/api";
import { waiverInputSchema } from "@instride/shared";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/shared/components/layout/page";
import { Button } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/waivers/new"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const createWaiver = useCreateWaiver();

  const form = useAppForm({
    defaultValues: {
      title: "",
      content: "",
    },
    validators: { onSubmit: waiverInputSchema },
    onSubmit: async ({ value }) => {
      try {
        await createWaiver.mutateAsync({
          request: { title: value.title, content: value.content },
        });
        toast.success("Waiver created");
        navigate({
          to: "/org/$slug/settings/organization/waivers",
          params: { slug: organization.slug },
        });
      } catch {
        toast.error("Failed to create waiver");
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="New waiver"
        description="Create a liability waiver for riders to sign."
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
            <ArrowLeftIcon />
            Back
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
                children={(field) => (
                  <field.TextField
                    label="Title"
                    placeholder="e.g. General Liability Waiver"
                  />
                )}
              />
              <form.AppField
                name="content"
                children={(field) => (
                  <field.TextareaField
                    label="Waiver content"
                    placeholder="Enter the full waiver text that riders will read and sign…"
                    rows={10}
                  />
                )}
              />
            </FieldGroup>

            <form.AppForm>
              <form.SubmitButton
                label="Create waiver"
                loadingLabel="Creating…"
              />
            </form.AppForm>
          </form>
        </div>
      </div>
    </div>
  );
}
