import Link from "next/link";
import { Activity, BadgeDollarSign, Percent, Plus, Scale, Target, TrendingUp } from "lucide-react";
import { EquityChart } from "@/components/charts-lazy";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildEquityCurve, getRuleHealth, summarizeTrades } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const [trades, accounts, goals] = await Promise.all([
    prisma.trade.findMany({ where: { userId: user.id }, include: { account: true }, orderBy: { tradeDate: "desc" } }),
    prisma.tradingAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.goal.findMany({ where: { userId: user.id, active: true }, orderBy: { createdAt: "desc" } })
  ]);
  const summary = summarizeTrades(trades);
  const startingBalance = accounts.reduce((sum, account) => sum + account.startingBalance, 0);
  const equity = buildEquityCurve(trades, startingBalance);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description=""
        action={
          <Button asChild>
            <Link href="/journal">
              <Plus className="h-4 w-4" />
              Add or edit trades
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total P/L" value={formatCurrency(summary.totalPnl)} hint="Across all tracked accounts" icon={BadgeDollarSign} tone={summary.totalPnl >= 0 ? "positive" : "negative"} />
        <StatCard label="Win rate" value={formatPercent(summary.winRate)} hint={`${summary.totalTrades} total trades logged`} icon={Percent} />
        <StatCard label="Average RR" value={summary.averageRr.toFixed(2)} hint="Average win divided by average loss" icon={Scale} />
        <StatCard label="Monthly P/L" value={formatCurrency(summary.monthlyPnl)} hint={`Weekly ${formatCurrency(summary.weeklyPnl)}`} icon={TrendingUp} tone={summary.monthlyPnl >= 0 ? "positive" : "negative"} />
      </div>

      {goals.length ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const progress = goal.targetValue > 0 ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0;
                return (
                  <div key={goal.id} className="rounded-lg border border-border bg-secondary/40 p-4">
                    <p className="text-sm font-medium capitalize">{goal.type.toLowerCase().replace(/_/g, " ")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{goal.period}</p>
                    <Progress value={progress} className="mt-3" />
                    <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Equity curve</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={equity} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => {
              const accountTrades = trades.filter((trade) => trade.accountId === account.id);
              const health = getRuleHealth(account, accountTrades);
              return (
                <div key={account.id} className="rounded-lg border border-border bg-secondary/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.broker}</p>
                    </div>
                    <Badge variant={health.ruleHealth < 35 ? "negative" : health.ruleHealth < 60 ? "warning" : "positive"}>{health.warning}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Balance</p>
                      <p className="font-semibold">{formatCurrency(account.currentBalance, account.currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold">{health.targetProgress.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Session</TableHead>
                <TableHead className="text-right">P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.slice(0, 6).map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>{trade.account.name}</TableCell>
                  <TableCell>{trade.strategyTag}</TableCell>
                  <TableCell>{trade.session}</TableCell>
                  <TableCell className={trade.profitLoss >= 0 ? "text-right text-emerald-300" : "text-right text-rose-300"}>
                    {formatCurrency(trade.profitLoss)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

