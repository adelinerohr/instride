import { useCreateLessonSeries } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { newLessonSearchSchema } from "@/features/calendar/lib/search-params";
import { LessonChoicesFormSection } from "@/features/lessons/components/form/choices";
import { LessonInformationFormSection } from "@/features/lessons/components/form/information";
import { LessonRidersFormSection } from "@/features/lessons/components/form/riders";
import {
  buildLessonDefaultValues,
  lessonFormOpts,
} from "@/features/lessons/lib/new-lesson.form";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { useAppForm } from "@/shared/hooks/use-form";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/admin/calendar/new"
)({
  component: RouteComponent,
  validateSearch: newLessonSearchSchema,
});

function RouteComponent() {
  const search = Route.useSearch();
  const createLesson = useCreateLessonSeries();
  const router = useRouter();

  const form = useAppForm({
    ...lessonFormOpts,
    defaultValues: buildLessonDefaultValues({
      start: new Date(search.start).toISOString(),
      boardId: search.boardId,
      trainerId: search.trainerId,
    }),
    onSubmit: ({ value }) => {
      const { riderIds, ...data } = value;
      createLesson.mutate(
        {
          ...data,
          start: data.start,
          levelId: data.levelId?.trim() === "" ? undefined : data.levelId,
          riderIds,
        },
        {
          onSuccess: () => {
            toast.success("Lesson created successfully");
            router.history.back();
          },
          onError: () => {
            toast.error("Failed to create lesson");
          },
        }
      );
    },
  });

  const stepOneComplete = useStore(form.store, (state) =>
    Boolean(
      state.values.boardId && state.values.trainerId && state.values.serviceId
    )
  );

  const stepTwoComplete = useStore(form.store, (state) =>
    Boolean(state.values.start && state.values.duration)
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col flex-1 min-h-0 h-full"
    >
      <div className="flex items-center justify-between border-b px-2 py-4 shrink-0">
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
      <div className="flex flex-col gap-4 p-4 overflow-y-auto pb-[50vh]">
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
