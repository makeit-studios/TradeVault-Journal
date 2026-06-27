import { addMonths, format, isSameDay } from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarCell } from "@/components/calendar-cell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildCalendarDays } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  const user = await requireUser();
  const trades = await prisma.trade.findMany({ where: { userId: user.id }, orderBy: { tradeDate: "asc" } });
  const monthOffset = Number(searchParams?.month) || 0;
  const days = buildCalendarDays(trades, monthOffset);
  const targetMonth = addMonths(new Date(), monthOffset);

  return (
    <>
      <PageHeader title="Trading Calendar" description="Tap a day to see trades. Daily P/L colored by session outcome." />
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
              <CalendarCell
                key={day.date.toISOString()}
                date={day.date}
                label={day.label}
                weekday={day.weekday}
                pnl={day.pnl}
                trades={day.trades}
                wins={day.wins}
                dayTrades={trades
                  .filter((t) => isSameDay(t.tradeDate, day.date))
                  .map((t) => ({
                    id: t.id,
                    symbol: t.symbol,
                    side: t.side,
                    entryPrice: t.entryPrice,
                    exitPrice: t.exitPrice,
                    profitLoss: t.profitLoss,
                    strategyTag: t.strategyTag
                  }))}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
