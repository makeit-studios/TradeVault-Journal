import { format } from "date-fns";
import { EquityChart, PnlBarChart, WinLossPie, WinRateChart } from "@/components/charts-lazy";
import { buildEquityCurve, buildMonthlyPnl, groupPnlBy, summarizeTrades } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { cn, formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [trades, accounts] = await Promise.all([
    prisma.trade.findMany({ where: { userId: user.id }, orderBy: { tradeDate: "asc" } }),
    prisma.tradingAccount.findMany({ where: { userId: user.id }, select: { startingBalance: true } })
  ]);
  const startingBalance = accounts.reduce((sum, account) => sum + account.startingBalance, 0);
  const summary = summarizeTrades(trades);
  const wins = trades.filter((trade) => trade.profitLoss > 0).length;
  const losses = trades.filter((trade) => trade.profitLoss < 0).length;
  const runningWinRate = trades.map((trade, index) => ({
    date: format(trade.tradeDate, "MMM d"),
    winRate: (trades.slice(0, index + 1).filter((item) => item.profitLoss > 0).length / (index + 1)) * 100
  }));

  const metrics: Array<{ label: string; value: string; tone: "up" | "down" | null }> = [
    { label: "Total P/L", value: formatCurrency(summary.totalPnl), tone: summary.totalPnl >= 0 ? "up" : "down" },
    { label: "Win Rate", value: `${summary.winRate.toFixed(1)}%`, tone: summary.winRate >= 50 ? "up" : "down" },
    { label: "Total Trades", value: String(summary.totalTrades), tone: null },
    { label: "Profit Factor", value: summary.profitFactor === Infinity ? "∞" : summary.profitFactor.toFixed(2), tone: summary.profitFactor >= 1.5 ? "up" : summary.profitFactor < 1 ? "down" : null },
    { label: "Best Trade", value: formatCurrency(summary.bestTrade), tone: "up" },
    { label: "Worst Trade", value: formatCurrency(summary.worstTrade), tone: "down" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-soft-gray">Performance metrics and trade analysis</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-dark-surface bg-dark-charcoal p-5">
            <p className="text-sm text-soft-gray">{m.label}</p>
            <p className={cn("mt-1 text-2xl font-semibold", m.tone === "up" && "text-success-green", m.tone === "down" && "text-error-red", !m.tone && "text-white")}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="xl:col-span-2 rounded-xl border border-dark-surface bg-dark-charcoal p-5">
          <h3 className="mb-4 text-sm font-medium text-white">Equity curve</h3>
          <EquityChart data={buildEquityCurve(trades, startingBalance)} />
        </div>

        <div className="rounded-xl border border-dark-surface bg-dark-charcoal p-5">
          <h3 className="mb-4 text-sm font-medium text-white">Win / loss split</h3>
          <WinLossPie wins={wins} losses={losses} />
        </div>

        <div className="rounded-xl border border-dark-surface bg-dark-charcoal p-5">
          <h3 className="mb-4 text-sm font-medium text-white">Win rate trend</h3>
          <WinRateChart data={runningWinRate} />
        </div>

        <div className="rounded-xl border border-dark-surface bg-dark-charcoal p-5">
          <h3 className="mb-4 text-sm font-medium text-white">By symbol</h3>
          <PnlBarChart data={groupPnlBy(trades, "symbol")} />
        </div>

        <div className="rounded-xl border border-dark-surface bg-dark-charcoal p-5">
          <h3 className="mb-4 text-sm font-medium text-white">By strategy</h3>
          <PnlBarChart data={groupPnlBy(trades, "strategyTag")} />
        </div>

        <div className="xl:col-span-2 rounded-xl border border-dark-surface bg-dark-charcoal p-5">
          <h3 className="mb-4 text-sm font-medium text-white">Monthly P/L</h3>
          <PnlBarChart data={buildMonthlyPnl(trades)} nameKey="month" />
        </div>
      </div>
    </>
  );
}
