import { format } from "date-fns";
import { EquityChart, PnlBarChart, WinLossPie, WinRateChart } from "@/components/charts";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildEquityCurve, buildMonthlyPnl, groupPnlBy } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [trades, accounts] = await Promise.all([
    prisma.trade.findMany({ where: { userId: user.id }, orderBy: { tradeDate: "asc" } }),
    prisma.tradingAccount.findMany({ where: { userId: user.id } })
  ]);
  const startingBalance = accounts.reduce((sum, account) => sum + account.startingBalance, 0);
  const wins = trades.filter((trade) => trade.profitLoss > 0).length;
  const losses = trades.filter((trade) => trade.profitLoss < 0).length;
  const runningWinRate = trades.map((trade, index) => ({
    date: format(trade.tradeDate, "MMM d"),
    winRate: (trades.slice(0, index + 1).filter((item) => item.profitLoss > 0).length / (index + 1)) * 100
  }));

  return (
    <>
      <PageHeader title="Analytics" description="Lightweight charts that reveal edge, consistency, and weak spots." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Equity curve</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={buildEquityCurve(trades, startingBalance)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Win / loss split</CardTitle>
          </CardHeader>
          <CardContent>
            <WinLossPie wins={wins} losses={losses} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Win rate trend</CardTitle>
          </CardHeader>
          <CardContent>
            <WinRateChart data={runningWinRate} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance by symbol</CardTitle>
          </CardHeader>
          <CardContent>
            <PnlBarChart data={groupPnlBy(trades, "symbol")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance by strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <PnlBarChart data={groupPnlBy(trades, "strategyTag")} />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Monthly P/L</CardTitle>
          </CardHeader>
          <CardContent>
            <PnlBarChart data={buildMonthlyPnl(trades)} nameKey="month" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
