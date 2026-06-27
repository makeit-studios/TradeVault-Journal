import type { InputHTMLAttributes } from "react";
import { format } from "date-fns";
import { createPayout } from "@/app/actions";
import { PnlBarChart } from "@/components/charts-lazy";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Clock, CheckCircle } from "lucide-react";

export default async function PayoutsPage() {
  const user = await requireUser();
  const [accounts, payouts] = await Promise.all([
    prisma.tradingAccount.findMany({ where: { userId: user.id } }),
    prisma.payout.findMany({ where: { userId: user.id }, include: { account: true }, orderBy: { date: "desc" } })
  ]);
  const total = payouts.filter((payout) => payout.status === "APPROVED").reduce((sum, payout) => sum + payout.amount, 0);
  const pending = payouts.filter((payout) => payout.status === "PENDING" || payout.status === "REQUESTED").reduce((sum, payout) => sum + payout.amount, 0);
  const monthly = Array.from(
    payouts.reduce((map, payout) => {
      const month = format(payout.date, "MMM yyyy");
      map.set(month, (map.get(month) ?? 0) + payout.amount);
      return map;
    }, new Map<string, number>())
  ).map(([name, pnl]) => ({ name, pnl }));

  return (
    <>
      <PageHeader title="Payouts" description="Track requested, pending, and approved withdrawals across accounts." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Approved payouts" value={formatCurrency(total)} hint="Received from funded or personal accounts" icon={CheckCircle} tone="positive" />
        <StatCard label="Pending payouts" value={formatCurrency(pending)} hint="Requested or awaiting approval" icon={Clock} />
        <StatCard label="Payout records" value={String(payouts.length)} hint="Total payout history entries" icon={Wallet} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader><CardTitle>Add payout</CardTitle></CardHeader>
          <CardContent>
            <form action={createPayout} className="grid gap-4">
              <div className="space-y-2">
                <Label>Account</Label>
                <select name="accountId" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
              </div>
              <Field name="amount" label="Amount" type="number" step="any" />
              <Field name="date" label="Date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              <div className="space-y-2">
                <Label>Status</Label>
                <select name="status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>REQUESTED</option><option>PENDING</option><option>APPROVED</option><option>REJECTED</option>
                </select>
              </div>
              <Field name="paymentMethod" label="Payment method" placeholder="Wise, bank transfer, crypto" />
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" />
              </div>
              <Button disabled={!accounts.length}>Save payout</Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Monthly payout totals</CardTitle></CardHeader>
            <CardContent><PnlBarChart data={monthly} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payout history</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Date</TableHead><TableHead>Account</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{format(payout.date, "MMM d, yyyy")}</TableCell>
                      <TableCell>{payout.account.name}</TableCell>
                      <TableCell><Badge variant={payout.status === "APPROVED" ? "positive" : payout.status === "REJECTED" ? "negative" : "warning"}>{payout.status}</Badge></TableCell>
                      <TableCell>{payout.paymentMethod}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payout.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

const Field = ({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) => {
  return <div className="space-y-2"><Label>{label}</Label><Input required {...props} /></div>;
};
