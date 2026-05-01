import { type Member, getUser } from "@instride/api";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxInput,
  ComboboxList,
} from "@/shared/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";
import { withFieldGroup } from "@/shared/hooks/use-form";

export const PinPickerFields = withFieldGroup({
  defaultValues: {
    memberId: "",
    pin: "",
  },
  props: {
    members: [],
    pickerPlaceholder: "Select yourself",
  } as {
    members: Member[];
    pickerLabel?: string;
    pickerPlaceholder?: string;
  },
  render: ({ group, ...props }) => {
    return (
      <>
        <group.Field
          name="memberId"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const currentItem = props.members.find(
              (member) => member.id === field.state.value
            );

            return (
              <Field>
                <FieldLabel>{props.pickerLabel}</FieldLabel>
                <Combobox
                  items={props.members}
                  value={currentItem}
                  onValueChange={(value) =>
                    field.handleChange(value ? value.id : "")
                  }
                  itemToStringLabel={(member) => member.authUser.name}
                >
                  <ComboboxInput
                    placeholder={props.pickerPlaceholder}
                    aria-invalid={isInvalid}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No members found</ComboboxEmpty>
                    <ComboboxList>
                      {(member: Member) => (
                        <ComboboxItem key={member.id} value={member}>
                          <UserAvatarItem user={getUser({ member })} />
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
            );
          }}
        />
        <group.Field
          name="pin"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Enter your PIN</FieldLabel>
                <InputOTP
                  maxLength={4}
                  type="password"
                  value={field.state.value}
                  onChange={field.handleChange}
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} aria-invalid={isInvalid} mask />
                    <InputOTPSlot index={1} aria-invalid={isInvalid} mask />
                    <InputOTPSlot index={2} aria-invalid={isInvalid} mask />
                    <InputOTPSlot index={3} aria-invalid={isInvalid} mask />
                  </InputOTPGroup>
                </InputOTP>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        />
      </>
    );
  },
});
