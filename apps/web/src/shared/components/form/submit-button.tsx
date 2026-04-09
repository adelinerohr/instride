import { useFormContext } from "@/shared/hooks/form";

import { Button } from "../ui/button";

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  label: string;
  loadingLabel: string;
};

export function SubmitButton({
  label,
  loadingLabel,
  className,
  ...props
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" className={className} disabled={isSubmitting}>
          {isSubmitting ? loadingLabel : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
