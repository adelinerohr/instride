import { getUser, type Rider, type Service, type Trainer } from "@instride/api";
import { formatInTimeZone } from "date-fns-tz";

import { quickCreateLessonFormOpts } from "@/features/lessons/lib/quick-create.form";
import { Separator } from "@/shared/components/ui/separator";
import { withForm } from "@/shared/hooks/use-form";

interface Props {
  eligibleRiders: Rider[];
  selectedTrainer: Trainer | undefined;
  services: Service[];
  timezone: string;
  startDate: Date;
  showRiderRow: boolean;
}

export const ConfirmStep = withForm({
  ...quickCreateLessonFormOpts,
  props: {} as Props,
  render: ({
    form,
    eligibleRiders,
    selectedTrainer,
    services,
    timezone,
    showRiderRow,
    startDate,
  }) => {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Review and confirm.</p>

        <form.Subscribe selector={(state) => state.values}>
          {(values) => {
            const rows: { label: string; value: string }[] = [];

            if (showRiderRow) {
              const riders = eligibleRiders.filter((r) =>
                values.riderIds.includes(r.id)
              );
              if (riders.length > 0) {
                const names = riders.map((r) => getUser({ rider: r }).name);
                const visible = names.slice(0, 2).join(", ");
                const remaining = names.length - 2;
                const value =
                  remaining > 0
                    ? `${visible}, + ${remaining} ${remaining === 1 ? "rider" : "riders"}`
                    : visible;

                rows.push({
                  label: "Riders",
                  value,
                });
              }
            }

            if (!selectedTrainer) return null;
            rows.push({
              label: "Trainer",
              value: getUser({ trainer: selectedTrainer }).name,
            });

            const service = services.find((s) => s.id === values.serviceId);
            if (!service) return null;
            rows.push({
              label: "Service",
              value: `${service.name} · ${service.duration} min`,
            });

            if (!values.start || !values.start.date || !values.start.time)
              return null;
            rows.push({
              label: "Date",
              value: formatInTimeZone(startDate, timezone, "EEEE, MMM d"),
            });
            rows.push({
              label: "Time",
              value: formatInTimeZone(startDate, timezone, "h:mm a"),
            });

            return (
              <div className="space-y-2.5 border rounded-lg p-3">
                {rows.map((row) => (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="text-foreground font-medium">
                      {row.value}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Total</span>
                  <span className="text-base font-semibold">
                    ${service.price}
                  </span>
                </div>
              </div>
            );
          }}
        </form.Subscribe>
      </div>
    );
  },
});
