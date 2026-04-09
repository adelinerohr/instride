import { levelOptions, useUpdateRider } from "@instride/api";
import type { Level, MemberWithRoles } from "@instride/shared";
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
  member: MemberWithRoles;
}

export function RiderLevel({ member }: RiderLevelProps) {
  const { data: levels } = useSuspenseQuery(
    levelOptions(member.organizationId).all()
  );
  const updateRider = useUpdateRider({
    memberId: member.id,
  });

  if (!levels) return null;

  if (!member.riderProfile) return null;

  return (
    <div className="p-4">
      <Field>
        <FieldLabel>Level</FieldLabel>
        <Select
          defaultValue={member.riderProfile.ridingLevelId ?? null}
          value={member.riderProfile.ridingLevelId ?? null}
          onValueChange={(value) => {
            updateRider.mutate({
              memberId: member.id,
              request: {
                ridingLevelId: value === null ? undefined : value,
              },
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
