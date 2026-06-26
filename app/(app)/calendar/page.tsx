import { addMonths, format } from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildCalendarDays } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { cn, formatCurrency } from "@/lib/utils";

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  const user = await requireUser();
  const trades = await prisma.trade.findMany({ where: { userId: user.id }, orderBy: { tradeDate: "asc" } });
  const monthOffset = Number(searchParams?.month) || 0;
  const days = buildCalendarDays(trades, monthOffset);
  const targetMonth = addMonths(new Date(), monthOffset);

  return (
    <>
      <PageHeader title="Trading Calendar" description="Daily P/L and trade count colored by session outcome." />
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/calendar?month=${monthOffset - 1}`}><ChevronLeft className="h-4 w-4" /></Link>
            </Button>
            <h3 className="text-sm font-semibold">{format(targetMonth, "MMMM yyyy")}</h3>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/calendar?month=${monthOffset + 1}`}><ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day}>{day}</div>)}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "min-h-28 rounded-lg border border-border bg-secondary/40 p-3",
                  day.pnl > 0 && "border-emerald-500/30 bg-emerald-500/10",
                  day.pnl < 0 && "border-rose-500/30 bg-rose-500/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.label}</span>
                  <span className="text-[11px] text-muted-foreground">{format(day.date, "EEE")}</span>
                </div>
                <p className={cn("mt-5 text-sm font-semibold", day.pnl > 0 && "text-emerald-300", day.pnl < 0 && "text-rose-300")}>
                  {day.trades ? formatCurrency(day.pnl) : "No trades"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{day.trades} trades</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
