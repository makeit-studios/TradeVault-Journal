import { cn } from "@/lib/utils";

export const Progress = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-all",
          value <= 0 && "w-0",
          value > 0 && value <= 25 && "w-1/4",
          value > 25 && value <= 50 && "w-1/2",
          value > 50 && value <= 75 && "w-3/4",
          value > 75 && "w-full"
        )}
      />
    </div>
  );
};
