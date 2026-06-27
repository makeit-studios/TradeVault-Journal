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
          "min-h-28 w-full rounded-lg border border-dark-surface bg-dark-charcoal p-3 text-left transition hover:border-medium-gray",
          pnl > 0 && "border-success-green/30 bg-success-green/5",
          pnl < 0 && "border-error-red/30 bg-error-red/5",
          dayTrades.length === 0 && "cursor-default"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{label}</span>
          <span className="text-[11px] text-soft-gray">{weekday}</span>
        </div>
        <p className={cn("mt-5 text-sm font-semibold", pnl > 0 && "text-success-green", pnl < 0 && "text-error-red")}>
          {trades ? formatCurrency(pnl) : "No trades"}
        </p>
        <p className="mt-1 text-xs text-soft-gray">{trades} trades</p>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-dark-surface bg-dark-charcoal p-6 shadow-l2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{format(date, "MMMM d, yyyy")}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-soft-gray hover:text-brand-gold"
              >
                Close
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-surface text-left text-soft-gray">
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
                  <tr key={trade.id} className="border-b border-dark-surface/50">
                    <td className="py-2 font-medium text-white">{trade.symbol}</td>
                    <td className="py-2">
                      <span className={cn("text-xs font-semibold", trade.side === "BUY" ? "text-success-green" : "text-error-red")}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-2 text-white">{trade.entryPrice}</td>
                    <td className="py-2 text-white">{trade.exitPrice ?? "—"}</td>
                    <td className="py-2 text-white">{trade.strategyTag || "—"}</td>
                    <td className={cn("py-2 text-right font-medium", trade.profitLoss >= 0 ? "text-success-green" : "text-error-red")}>
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
