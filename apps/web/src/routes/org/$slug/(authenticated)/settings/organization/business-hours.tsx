import {
  boardsOptions,
  businessHoursOptions,
  organizationOptions,
  useResetOrganizationBusinessHours,
  useUpdateOrganization,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { BusinessHoursForm } from "@/features/organization/components/business-hours/form";
import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FieldLabel } from "@/shared/components/ui/field";
import { Field } from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/business-hours"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      businessHoursOptions.organization()
    );
    await context.queryClient.ensureQueryData(boardsOptions.list());
    await context.queryClient.ensureQueryData(
      organizationOptions.byId(context.organization.id)
    );
  },
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const { data: organization } = useSuspenseQuery(
    organizationOptions.byId(context.organization.id)
  );
  const updateOrganization = useUpdateOrganization();

  const { data: availability } = useSuspenseQuery(
    businessHoursOptions.organization()
  );
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

  const resetBoard = useResetOrganizationBusinessHours();

  const [activeTab, setActiveTab] = React.useState<"defaults" | string>(
    "defaults"
  );

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Organization business hours"
        description="Set your organization's operating hours. Boards can inherit these defaults or set their own. Each day can have multiple open windows."
      >
        <div className="space-y-6 max-w-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="defaults">Organization Defaults</TabsTrigger>
              {boards.map((board) => (
                <TabsTrigger key={board.id} value={board.id}>
                  {board.name}
                  {availability.boardOverrides[board.id]?.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-xs">
                      Custom
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Org-wide defaults */}
            <TabsContent value="defaults">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Defaults</CardTitle>
                  <CardDescription>
                    These hours apply to all boards unless overridden.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessHoursForm
                    type="organization"
                    existing={availability.defaults}
                    boardId={null}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Per-board overrides */}
            {boards.map((board) => {
              const boardHours = availability.boardOverrides[board.id] ?? [];
              const hasOverride = boardHours.length > 0;
              // Fall back to org defaults when no override
              const effectiveHours = hasOverride
                ? boardHours
                : availability.defaults;

              return (
                <TabsContent key={board.id} value={board.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{board.name}</CardTitle>
                          <CardDescription>
                            {hasOverride
                              ? "This board has custom hours."
                              : "Using organization defaults."}
                          </CardDescription>
                        </div>
                        {hasOverride && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              confirmationModalHandler.openWithPayload({
                                title: "Reset to organization defaults?",
                                description:
                                  "This will remove the custom hours for this board and fall back to the organization-wide defaults. This cannot be undone.",
                                onConfirm: async () => {
                                  await resetBoard.mutateAsync({
                                    boardId: board.id,
                                  });
                                  setActiveTab("defaults");
                                  toast.success(
                                    "Board hours reset to organization defaults"
                                  );
                                },
                              })
                            }
                          >
                            <RotateCcwIcon className="h-3.5 w-3.5 mr-1.5" />
                            Reset to defaults
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <BusinessHoursForm
                        type="organization"
                        existing={effectiveHours}
                        boardId={board.id}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </AnnotatedSection>
      <Separator />
      <AnnotatedSection
        title="Organization preferences"
        description="Set your preferences as an organization."
      >
        <Card>
          <CardHeader>
            <CardDescription>
              These preferences apply to all organization staff Members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="allowSameDayBookings">
                Allow same day bookings
              </FieldLabel>
              <Switch
                id="allowSameDayBookings"
                checked={organization.allowSameDayBookings}
                onCheckedChange={(value) =>
                  updateOrganization.mutateAsync(
                    {
                      organizationId: organization.id,
                      request: {
                        allowSameDayBookings: value,
                      },
                    },
                    {
                      onSuccess: () => {
                        toast.success("Organization preferences updated");
                      },
                      onError: (error) => {
                        toast.error(error.message);
                      },
                    }
                  )
                }
              />
            </Field>
          </CardContent>
        </Card>
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}
