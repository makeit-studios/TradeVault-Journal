import { cn } from "@/lib/utils";

export const Progress = ({ value, className }: { value: number; className?: string }) => {
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-dark-surface", className)}>
      <div
        className="h-full rounded-full bg-brand-gold transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
