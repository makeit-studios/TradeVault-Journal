import type { InputHTMLAttributes } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { createTrade, deleteTrade } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { TagSelector } from "@/components/tag-selector";
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

export default async function JournalPage() {
  const user = await requireUser();
  const [accounts, trades] = await Promise.all([
    prisma.tradingAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.trade.findMany({ where: { userId: user.id }, include: { account: true }, orderBy: { tradeDate: "desc" }, take: 100 })
  ]);

  return (
    <>
      <PageHeader title="Trade Journal" description="Add new trades, then use Edit in trade history to update an existing entry." />
      <div className="grid gap-6 2xl:grid-cols-[440px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add trade</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTrade} encType="multipart/form-data" className="grid gap-4">
              <div className="space-y-2">
                <Label>Account</Label>
                <select name="accountId" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="symbol" label="Symbol" placeholder="EURUSD" />
                <div className="space-y-2">
                  <Label>Side</Label>
                  <select name="side" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>BUY</option>
                    <option>SELL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Market type</Label>
                  <select name="marketType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Auto</option>
                    <option>FOREX</option>
                    <option>CRYPTO</option>
                    <option>STOCKS</option>
                    <option>FUTURES</option>
                    <option>OPTIONS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <select name="timeframe" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select</option>
                    <option>M1</option>
                    <option>M5</option>
                    <option>M15</option>
                    <option>M30</option>
                    <option>H1</option>
                    <option>H4</option>
                    <option>D1</option>
                    <option>W1</option>
                    <option>MN</option>
                  </select>
                </div>
              </div>
              <details className="rounded-lg border border-border bg-secondary/20 p-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Entry / Exit</summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field name="entryPrice" label="Entry" type="number" step="any" />
                  <Field name="exitPrice" label="Exit" type="number" step="any" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field name="stopLoss" label="Stop loss" type="number" step="any" />
                  <Field name="takeProfit" label="Take profit" type="number" step="any" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field name="lotSize" label="Lot size" type="number" step="any" />
                  <Field name="riskPercent" label="Risk %" type="number" step="any" />
                </div>
              </details>
              <div className="grid grid-cols-2 gap-3">
                <Field name="profitLoss" label="Profit / loss" type="number" step="any" />
                <Field name="tradeDate" label="Trade date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select name="status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Auto (from P/L)</option>
                    <option>WIN</option>
                    <option>LOSS</option>
                    <option>BREAKEVEN</option>
                    <option>PENDING</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex h-10 items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label key={star} className="cursor-pointer">
                        <input type="radio" name="rating" value={star} className="peer sr-only" />
                        <span className="text-xl text-muted-foreground peer-checked:text-amber-400">★</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <details className="rounded-lg border border-border bg-secondary/20 p-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Plan & Reflection</summary>
                <div className="mt-3 space-y-2">
                  <Label>Pre-trade plan</Label>
                  <Textarea name="preTradePlan" placeholder="Confluence, bias, entry trigger, invalidation..." />
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Post-trade reflection</Label>
                  <Textarea name="postTradeReflection" placeholder="What went well? What would you change?" />
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Notes</Label>
                  <Textarea name="notes" placeholder="Execution notes, context, management..." />
                </div>
              </details>
              <details className="rounded-lg border border-border bg-secondary/20 p-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Psychology</summary>
                <div className="mt-3 space-y-2">
                  <Label>Emotions before / during</Label>
                  <TagSelector name="emotions" options={["Calm", "Anxious", "Confident", "Greedy", "Fearful", "Frustrated", "Neutral", "Excited", "Revenge", "Overtrading"]} />
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Mistakes made</Label>
                  <TagSelector name="mistakes" options={["FOMO", "Sizing too big", "No stop loss", "Moving SL", "Revenge trading", "Overtrading", "Early exit", "Late entry", "Ignoring HTF", "Not following plan"]} />
                </div>
              </details>
              <div className="grid grid-cols-2 gap-3">
                <Field name="session" label="Session" placeholder="London" />
                <Field name="strategyTag" label="Strategy" placeholder="Liquidity sweep" />
              </div>
              <details className="rounded-lg border border-border bg-secondary/20 p-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Screenshots</summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field name="beforeScreenshot" label="Before entry" type="file" accept="image/*" required={false} />
                  <Field name="afterScreenshot" label="After exit" type="file" accept="image/*" required={false} />
                </div>
                <div className="mt-3">
                  <Field name="annotatedScreenshot" label="Annotated chart" type="file" accept="image/*" required={false} />
                </div>
              </details>
              <Button disabled={!accounts.length}>Save trade</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trade history</CardTitle>
              <details className="relative">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">CSV import</summary>
                <form
                  action="/api/trades/import"
                  method="POST"
                  encType="multipart/form-data"
                  className="absolute right-0 top-6 z-10 w-72 rounded-lg border border-border bg-card p-4 shadow-lg"
                >
                  <p className="mb-2 text-xs text-muted-foreground">Upload a CSV with columns: symbol,side,entryPrice,exitPrice,stopLoss,takeProfit,lotSize,profitLoss,tradeDate,strategyTag,notes</p>
                  <Input name="file" type="file" accept=".csv" required />
                  <Button type="submit" size="sm" className="mt-2 w-full">Upload CSV</Button>
                </form>
              </details>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{format(trade.tradeDate, "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell><Badge variant={trade.side === "BUY" ? "positive" : "warning"}>{trade.side}</Badge></TableCell>
                    <TableCell>{trade.account.name}</TableCell>
                    <TableCell>{trade.strategyTag}</TableCell>
                    <TableCell className={trade.profitLoss >= 0 ? "text-right text-emerald-300" : "text-right text-rose-300"}>{formatCurrency(trade.profitLoss)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm"><Link href={`/journal/${trade.id}/edit`}>Edit</Link></Button>
                        <form action={deleteTrade}>
                          <input type="hidden" name="id" value={trade.id} />
                          <Button variant="ghost" size="sm">Delete</Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!trades.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No trades yet. Add your first trade with the form on this page.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
