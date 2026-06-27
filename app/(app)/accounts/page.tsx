import type { InputHTMLAttributes } from "react";
import { createAccount, deleteAccount } from "@/app/actions";
import { EditAccountDialog } from "@/components/edit-account-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getRuleHealth } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";

export default async function AccountsPage() {
  const user = await requireUser();
  const accounts = await prisma.tradingAccount.findMany({
    where: { userId: user.id },
    include: { trades: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <PageHeader title="Accounts" description="Manage personal and prop firm accounts, balances, rules, and health." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAccount} className="grid gap-4">
              <Field name="name" label="Account name" placeholder="FTMO Challenge 100K" />
              <Field name="broker" label="Broker / prop firm" placeholder="FTMO" />
              <Field name="accountType" label="Account type" placeholder="Prop firm challenge" />
              <div className="grid grid-cols-2 gap-3">
                <Field name="startingBalance" label="Starting balance" type="number" />
                <Field name="currentBalance" label="Current balance" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="profitTarget" label="Profit target" type="number" />
                <Field name="dailyDrawdown" label="Daily DD" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="maxDrawdown" label="Max DD" type="number" />
                <Field name="minTradingDays" label="Min days" type="number" defaultValue="5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select name="status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>ACTIVE</option>
                    <option>PAUSED</option>
                    <option>PASSED</option>
                    <option>FUNDED</option>
                    <option>BREACHED</option>
                  </select>
                </div>
                <Field name="currency" label="Currency" defaultValue="USD" />
              </div>
              <Button>Create account</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {accounts.map((account) => {
            const health = getRuleHealth(account, account.trades);
            const pnl = account.trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
            return (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{account.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{account.broker} · {account.accountType}</p>
                    </div>
                    <Badge variant={account.status === "BREACHED" ? "negative" : "positive"}>{account.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Metric label="Balance" value={formatCurrency(account.currentBalance, account.currency)} />
                    <Metric label="P/L" value={formatCurrency(pnl, account.currency)} tone={pnl >= 0 ? "positive" : "negative"} />
                    <Metric label="Daily DD left" value={formatCurrency(health.remainingDailyDrawdown, account.currency)} />
                    <Metric label="Max DD left" value={formatCurrency(health.remainingMaxDrawdown, account.currency)} />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Profit target</span>
                      <span>{health.targetProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={health.targetProgress} />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Rule health</span>
                      <span>{health.warning}</span>
                    </div>
                    <Progress value={health.ruleHealth} />
                  </div>
                  <div className="flex gap-2">
                    <EditAccountDialog account={{ ...account, minTradingDays: account.minTradingDays ?? 0 }} />
                    <form action={deleteAccount}>
                      <input type="hidden" name="id" value={account.id} />
                      <Button variant="outline" size="sm">Delete</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

const Field = ({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input required {...props} />
    </div>
  );
};

const Metric = ({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) => {
  return (
    <div className="rounded-md bg-secondary/60 p-3">
      <p className="text-muted-foreground">{label}</p>
      <p className={tone === "positive" ? "font-semibold text-emerald-300" : tone === "negative" ? "font-semibold text-rose-300" : "font-semibold"}>{value}</p>
    </div>
  );
};
