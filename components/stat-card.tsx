import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <Card className="animate-fade-up">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="rounded-md bg-secondary p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <p className={cn("mt-4 text-3xl font-semibold", tone === "positive" && "text-emerald-300", tone === "negative" && "text-rose-300")}>
          {value}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
