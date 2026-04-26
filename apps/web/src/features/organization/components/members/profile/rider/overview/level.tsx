import {
  levelOptions,
  useUpdateRider,
  type Level,
  type Member,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export interface RiderLevelProps {
  member: Member;
}

export function RiderLevel({ member }: RiderLevelProps) {
  const { data: levels } = useSuspenseQuery(levelOptions.list());
  const updateRider = useUpdateRider();

  if (!levels) return null;

  if (!member.rider) return null;

  return (
    <div className="p-4">
      <Field>
        <FieldLabel>Level</FieldLabel>
        <Select
          defaultValue={member.rider.ridingLevelId ?? null}
          value={member.rider.ridingLevelId ?? null}
          onValueChange={(value) => {
            updateRider.mutate({
              riderId: member.id,
              ridingLevelId: value === null ? undefined : value,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: Level | null) => (
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: value?.color ?? "gray" }}
                  />
                  <span>{value?.name ?? "Unrestricted"}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: "gray" }}
                />
                <span>Unrestricted</span>
              </div>
            </SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  <span>{level.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
