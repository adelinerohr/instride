import { cn } from "@/shared/lib/utils";

export function StepIndicator(props: { stepIndex: number; stepCount: number }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex gap-1.5">
        {Array.from({ length: props.stepCount }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === props.stepIndex
                ? "w-6 bg-foreground"
                : i < props.stepIndex
                  ? "w-1.5 bg-foreground"
                  : "w-1.5 bg-foreground/10"
            )}
          />
        ))}
      </div>
      <span>
        Step {props.stepIndex + 1} of {props.stepCount}
      </span>
    </div>
  );
}
