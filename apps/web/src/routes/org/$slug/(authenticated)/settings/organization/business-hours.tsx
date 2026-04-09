import {
  boardsOptions,
  businessHoursOptions,
  useResetOrganizationBusinessHours,
  useUpsertOrganizationBusinessHours,
  type types,
} from "@instride/api";
import {
  buildEmptyWeek,
  DayOfWeek,
  organizationAvailabilitySchema,
  type DayHours,
} from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DayRow } from "@/features/organization/components/business-hours/day-row";
import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/organization/business-hours"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      businessHoursOptions.organization()
    );
    await context.queryClient.ensureQueryData(boardsOptions.list());
  },
});

function RouteComponent() {
  const { data: availability } = useSuspenseQuery(
    businessHoursOptions.organization()
  );
  const { data: boards } = useSuspenseQuery(boardsOptions.list());

  const resetBoard = useResetOrganizationBusinessHours();

  const [resetConfirmBoardId, setResetConfirmBoardId] = React.useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = React.useState<"defaults" | string>(
    "defaults"
  );

  const boardsWithOverrides = boards.filter(
    (board) => availability.boardOverrides[board.id]?.length > 0
  );

  return (
    <AnnotatedLayout>
      <AnnotatedSection
        title="Personal details"
        description="Set your organization's operating hours. Boards can inherit these defaults or set their own."
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
                  <OrgBusinessHoursForm
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
                            onClick={() => setResetConfirmBoardId(board.id)}
                          >
                            <RotateCcwIcon className="h-3.5 w-3.5 mr-1.5" />
                            Reset to defaults
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <OrgBusinessHoursForm
                        existing={effectiveHours}
                        boardId={board.id}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Reset confirmation */}
          <AlertDialog
            open={resetConfirmBoardId !== null}
            onOpenChange={(open) => !open && setResetConfirmBoardId(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Reset to organization defaults?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the custom hours for this board and fall back
                  to the organization-wide defaults. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (!resetConfirmBoardId) return;
                    await resetBoard.mutateAsync({
                      boardId: resetConfirmBoardId,
                    });
                    setResetConfirmBoardId(null);
                    setActiveTab("defaults");
                    toast.success("Board hours reset to organization defaults");
                  }}
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}

interface OrgBusinessHoursFormProps {
  /** Existing saved data to pre-populate (7 rows, one per day) */
  existing: types.OrganizationBusinessHours[];
  boardId: string | null;
}

export function OrgBusinessHoursForm({
  existing,
  boardId,
}: OrgBusinessHoursFormProps) {
  const upsert = useUpsertOrganizationBusinessHours();

  // Build initial days: fill from existing or use empty defaults
  const initialDays: DayHours[] = Object.values(DayOfWeek).map((dow) => {
    const saved = existing.find((r) => r.dayOfWeek === dow);
    if (saved) {
      return {
        dayOfWeek: dow as DayOfWeek,
        isOpen: saved.isOpen,
        openTime: saved.openTime,
        closeTime: saved.closeTime,
      };
    }
    return buildEmptyWeek().find((d) => d.dayOfWeek === dow)!;
  });

  const form = useAppForm({
    defaultValues: { days: initialDays },
    validators: {
      onSubmit: organizationAvailabilitySchema,
    },
    onSubmit: async ({ value }) => {
      await upsert.mutateAsync({ boardId, days: value.days });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="days" mode="array">
        {(field) => (
          <div className="rounded-md border">
            {field.state.value.map((day, i) => (
              <form.Field key={day.dayOfWeek} name={`days[${i}]`}>
                {(dayField) => (
                  <DayRow
                    day={dayField.state.value}
                    onChange={(updated) => dayField.handleChange(updated)}
                  />
                )}
              </form.Field>
            ))}
          </div>
        )}
      </form.Field>

      <div className="flex justify-end">
        <form.AppForm>
          <form.SubmitButton label="Save hours" loadingLabel="Saving…" />
        </form.AppForm>
      </div>
    </form>
  );
}
