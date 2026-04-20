import {
  useUpsertOrganizationBusinessHours,
  useUpsertTrainerBusinessHours,
  type types,
} from "@instride/api";
import {
  availabilityDaysFormSchema,
  buildEmptyWeek,
  DayOfWeek,
  normalizeTimeSlot,
  type DayHours,
  type TimeSlot,
} from "@instride/shared";
import * as React from "react";
import { toast } from "sonner";

import { useAppForm } from "@/shared/hooks/use-form";

import { DayRow } from "./day-row";

interface OrgBusinessHoursFormProps {
  type: "organization";
  existing: types.OrganizationBusinessHours[];
  boardId: string | null;
}

interface TrainerBusinessHoursFormProps {
  type: "trainer";
  trainerId: string;
  /** Existing saved trainer rows for this scope (defaults or a specific board) */
  existing: (types.TrainerBusinessHours | types.OrganizationBusinessHours)[];
  /** Effective org hours for this scope — used for inline hints and clamp context */
  orgHours: types.OrganizationBusinessHours[];
  boardId: string | null;
}

type BusinessHoursFormProps =
  | OrgBusinessHoursFormProps
  | TrainerBusinessHoursFormProps;

export function BusinessHoursForm(props: BusinessHoursFormProps) {
  const updateOrganizationBusinessHours = useUpsertOrganizationBusinessHours();
  const updateTrainerBusinessHours = useUpsertTrainerBusinessHours();

  // Build initial days: for each day-of-week, either lift the saved row
  // (normalizing each slot's time strings) or use an empty closed day.
  const initialDays: DayHours[] = Object.values(DayOfWeek).map((dow) => {
    const saved = props.existing.find((r) => r.dayOfWeek === dow);
    if (saved) {
      return {
        dayOfWeek: dow as DayOfWeek,
        isOpen: saved.isOpen,
        slots: saved.isOpen
          ? saved.slots.map((s) => ({
              openTime: normalizeTimeSlot(s.openTime, "09:00"),
              closeTime: normalizeTimeSlot(s.closeTime, "17:00"),
            }))
          : [],
      };
    }
    return buildEmptyWeek().find((d) => d.dayOfWeek === dow)!;
  });

  const form = useAppForm({
    defaultValues: { days: initialDays },
    canSubmitWhenInvalid: true,
    validators: {
      onSubmit: availabilityDaysFormSchema,
    },
    onSubmitInvalid: ({ formApi }) => {
      const first = formApi.state.errors[0];
      toast.error(
        typeof first === "string"
          ? first
          : "Please fix the highlighted fields and try again."
      );
    },
    onSubmit: async ({ value }) => {
      if (props.type === "organization") {
        await updateOrganizationBusinessHours.mutateAsync(
          {
            boardId: props.boardId,
            days: value.days,
          },
          {
            onSuccess: () => {
              toast.success("Business hours updated");
            },
            onError: (error) => {
              toast.error(error.message);
            },
          }
        );
      } else {
        await updateTrainerBusinessHours.mutateAsync(
          {
            trainerId: props.trainerId,
            params: {
              boardId: props.boardId,
              days: value.days,
            },
          },
          {
            onSuccess: () => {
              toast.success("Business hours updated");
            },
            onError: (error) => {
              toast.error(error.message);
            },
          }
        );
      }
    },
  });

  // Index org hours by day so each DayRow can receive a matching hint.
  const orgHintByDay = React.useMemo(() => {
    if (props.type !== "trainer") return undefined;
    const map = new Map<DayOfWeek, { isOpen: boolean; slots: TimeSlot[] }>();
    for (const row of props.orgHours) {
      map.set(row.dayOfWeek, {
        isOpen: row.isOpen,
        slots: row.slots.map((s) => ({
          openTime: s.openTime,
          closeTime: s.closeTime,
        })),
      });
    }
    return map;
  }, [props]);

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
          <div className="rounded-md border flex flex-col divide-y">
            {([0, 1, 2, 3, 4, 5, 6] as const).map((i) => (
              <DayRow
                key={field.state.value[i].dayOfWeek}
                form={form}
                fields={`days[${i}]`}
                orgHint={
                  orgHintByDay
                    ? orgHintByDay.get(field.state.value[i].dayOfWeek)
                    : null
                }
              />
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
