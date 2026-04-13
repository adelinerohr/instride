import { Button, Spinner, useThemeColor } from "heroui-native";

import { useFormContext } from "@/hooks/use-form";

interface SubmitButtonProps {
  label: string;
}

export function SubmitButton({ label }: SubmitButtonProps) {
  const form = useFormContext();
  const themeColorAccentForeground = useThemeColor("accent-foreground");

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button isDisabled={isSubmitting} onPress={form.handleSubmit}>
          {isSubmitting && (
            <Spinner color={themeColorAccentForeground} size="sm" />
          )}
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
