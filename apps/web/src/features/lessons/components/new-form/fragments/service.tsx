import { type Board, type Service } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import * as React from "react";

import { riderCreateLessonFormOpts } from "@/features/lessons/lib/rider.form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { withForm } from "@/shared/hooks/use-form";

export const ServiceSelect = withForm({
  ...riderCreateLessonFormOpts,
  props: {
    boards: [] as Board[],
    services: [] as Service[],
    isPending: false,
    riderLevelId: null as string | null,
  },
  render: ({ form, boards, services, isPending, riderLevelId }) => {
    const selectedBoardId = useStore(
      form.store,
      (state) => state.values.boardId
    );
    const selectedTrainerId = useStore(
      form.store,
      (state) => state.values.trainerId
    );
    const selectedServiceId = useStore(
      form.store,
      (state) => state.values.serviceId
    );

    const selectedBoard = React.useMemo(
      () => boards.find((b) => b.id === selectedBoardId),
      [boards, selectedBoardId]
    );

    const serviceOptions = React.useMemo(() => {
      if (!selectedBoard || !selectedTrainerId) return [];

      const activeBoardServiceIds = new Set(
        selectedBoard.serviceBoardAssignments
          .filter((sba) => sba.isActive)
          .map((sba) => sba.serviceId)
      );

      return services.filter((s) => {
        if (!activeBoardServiceIds.has(s.id)) return false;
        if (!s.isActive || !s.canRiderAdd) return false;

        // Trainer assignment: if isAllTrainers, any trainer works; otherwise
        // the selected trainer must be in trainerAssignments.
        if (!s.isAllTrainers) {
          const trainerOK = s.trainerAssignments.some(
            (a) => a.trainerId === selectedTrainerId && a.isActive
          );
          if (!trainerOK) return false;
        }

        // Level restriction: if the service is restricted to a level, the
        // rider must be at that level.
        if (s.isRestricted && s.restrictedToLevelId !== riderLevelId) {
          return false;
        }

        return true;
      });
    }, [selectedBoard, selectedTrainerId, services, riderLevelId]);

    const handleServiceChange = (newServiceId: string) => {
      form.setFieldValue("serviceId", newServiceId);
    };

    React.useEffect(() => {
      if (
        selectedTrainerId &&
        !selectedServiceId &&
        serviceOptions.length === 1
      ) {
        handleServiceChange(serviceOptions[0].id);
      }
    }, [selectedTrainerId, selectedServiceId, serviceOptions]);

    return (
      <form.Field name="serviceId">
        {(field) => {
          const showServices =
            selectedTrainerId && serviceOptions.length > 0 && !isPending;
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <FieldSet>
              <FieldLegend>
                Service <span className="text-destructive">*</span>
              </FieldLegend>
              {!showServices && (
                <FieldDescription>
                  Select a trainer and board to see available services.
                </FieldDescription>
              )}
              {showServices && (
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={handleServiceChange}
                >
                  {serviceOptions.map((service) => (
                    <FieldLabel
                      key={service.id}
                      htmlFor={service.id}
                      className="bg-white"
                    >
                      <Field
                        orientation="horizontal"
                        data-invalid={isInvalid}
                        className="w-full items-center! p-3! gap-3"
                      >
                        <RadioGroupItem
                          value={service.id}
                          id={service.id}
                          aria-invalid={isInvalid}
                        />
                        <FieldContent className="flex-1">
                          <span className="font-medium">{service.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {service.isPrivate || service.maxRiders === 1
                              ? "Private"
                              : `Up to ${service.maxRiders} riders`}
                          </span>
                        </FieldContent>
                        <span className="font-semibold">
                          {`$${service.price}`}
                        </span>
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              )}
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          );
        }}
      </form.Field>
    );
  },
});
