"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";

interface TradeSummary {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  exitPrice: number | null;
  profitLoss: number;
  strategyTag: string;
}

interface CalendarCellProps {
  date: Date;
  label: string;
  weekday: string;
  pnl: number;
  trades: number;
  wins: number;
  dayTrades: TradeSummary[];
}

export function CalendarCell({ date, label, weekday, pnl, trades, wins, dayTrades }: CalendarCellProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => dayTrades.length > 0 && setOpen(true)}
        className={cn(
          "min-h-28 w-full rounded-lg border border-border bg-secondary/40 p-3 text-left transition hover:bg-secondary/60",
          pnl > 0 && "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
          pnl < 0 && "border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20",
          dayTrades.length === 0 && "cursor-default"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-[11px] text-muted-foreground">{weekday}</span>
        </div>
        <p className={cn("mt-5 text-sm font-semibold", pnl > 0 && "text-emerald-300", pnl < 0 && "text-rose-300")}>
          {trades ? formatCurrency(pnl) : "No trades"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{trades} trades</p>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{format(date, "MMMM d, yyyy")}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Symbol</th>
                  <th className="pb-2 font-medium">Side</th>
                  <th className="pb-2 font-medium">Entry</th>
                  <th className="pb-2 font-medium">Exit</th>
                  <th className="pb-2 font-medium">Strategy</th>
                  <th className="pb-2 text-right font-medium">P/L</th>
                </tr>
              </thead>
              <tbody>
                {dayTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50">
                    <td className="py-2 font-medium">{trade.symbol}</td>
                    <td className="py-2">
                      <span className={cn("text-xs font-semibold", trade.side === "BUY" ? "text-emerald-300" : "text-rose-300")}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-2">{trade.entryPrice}</td>
                    <td className="py-2">{trade.exitPrice ?? "—"}</td>
                    <td className="py-2">{trade.strategyTag || "—"}</td>
                    <td className={cn("py-2 text-right font-medium", trade.profitLoss >= 0 ? "text-emerald-300" : "text-rose-300")}>
                      {formatCurrency(trade.profitLoss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}
