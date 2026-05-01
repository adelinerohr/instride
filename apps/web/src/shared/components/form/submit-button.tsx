import type { LucideIcon } from "lucide-react";

import { useFormContext } from "@/shared/hooks/use-form";

import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  label: string;
  loadingLabel?: string;
  icon?: LucideIcon;
};

export function SubmitButton({
  label,
  loadingLabel,
  className,
  icon: Icon,
  ...props
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          className={className}
          disabled={isSubmitting}
          {...props}
        >
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting && loadingLabel}
          {!isSubmitting && label}
          {Icon && <Icon />}
        </Button>
      )}
    </form.Subscribe>
  );
}
