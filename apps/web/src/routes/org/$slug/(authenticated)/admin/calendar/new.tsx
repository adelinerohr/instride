import { useCreateLessonSeries } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { LessonChoicesFormSection } from "@/features/lessons/components/form/choices";
import { LessonInformationFormSection } from "@/features/lessons/components/form/information";
import { LessonRidersFormSection } from "@/features/lessons/components/form/riders";
import { lessonFormOpts } from "@/features/lessons/lib/new-lesson.form";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { useAppForm } from "@/shared/hooks/form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/calendar/new"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const createLesson = useCreateLessonSeries();
  const router = useRouter();

  const form = useAppForm({
    ...lessonFormOpts,
    onSubmit: ({ value }) => {
      const { riderIds, ...data } = value;
      createLesson.mutate({
        ...data,
        start: data.start.toISOString(),
        recurrenceEnd: data.recurrenceEnd?.toISOString() ?? null,
        effectiveFrom: data.effectiveFrom?.toISOString() ?? null,
        lastPlannedUntil: data.lastPlannedUntil?.toISOString() ?? null,
        levelId: data.levelId?.trim() === "" ? undefined : data.levelId,
        riderIds: riderIds.map((rider) => rider.id),
      });
    },
  });

  const stepOneComplete = useStore(form.store, (state) =>
    Boolean(
      state.values.boardId && state.values.trainerId && state.values.serviceId
    )
  );

  const stepTwoComplete = useStore(form.store, (state) =>
    Boolean(state.values.start && state.values.duration && state.values.name)
  );

  return (
    <form
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
          <h1 className="font-semibold text-2xl">Create New Lesson</h1>
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
      <div className="flex flex-col gap-4 p-4">
        <LessonChoicesFormSection form={form} canProceed={stepOneComplete} />
        <LessonInformationFormSection
          form={form}
          isUnlocked={stepOneComplete}
          canProceed={stepTwoComplete}
        />
        <LessonRidersFormSection
          form={form}
          isUnlocked={stepOneComplete && stepTwoComplete}
        />
      </div>
    </form>
  );
}
