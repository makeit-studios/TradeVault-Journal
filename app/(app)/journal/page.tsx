import type { InputHTMLAttributes } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { createTrade, deleteTrade } from "@/app/actions";
import { Combobox } from "@/components/combobox";
import { CsvImport } from "@/components/csv-import";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/page-header";
import { PnlCalculator } from "@/components/pnl-calculator";
import { StarRating } from "@/components/star-rating";
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

export default async function JournalPage({ searchParams }: { searchParams: { search?: string } }) {
  const user = await requireUser();
  const search = searchParams?.search?.trim().toLowerCase();
  const tradeWhere = search
    ? {
        userId: user.id,
        OR: [
          { symbol: { contains: search } },
          { strategyTag: { contains: search } },
          { session: { contains: search } },
          { notes: { contains: search } },
          { account: { name: { contains: search } } }
        ]
      }
    : { userId: user.id };

  const [accounts, trades, existingSymbols, existingStrategies] = await Promise.all([
    prisma.tradingAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.trade.findMany({ where: tradeWhere, include: { account: true }, orderBy: { tradeDate: "desc" }, take: 100 }),
    prisma.trade.findMany({ where: { userId: user.id, symbol: { not: "" } }, distinct: ["symbol"], select: { symbol: true } }),
    prisma.trade.findMany({ where: { userId: user.id, strategyTag: { not: "" } }, distinct: ["strategyTag"], select: { strategyTag: true } })
  ]);
  const symbols = existingSymbols.map((s) => s.symbol).filter(Boolean).sort();
  const strategies = existingStrategies.map((s) => s.strategyTag).filter(Boolean).sort();

  return (
    <>
      <PageHeader title="Trade Journal" description="" />
      <div className="grid gap-6 2xl:grid-cols-[440px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add trade</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTrade} encType="multipart/form-data" className="grid gap-4">

              <details className="rounded-lg border border-dark-surface bg-dark-charcoal p-3">
                <summary className="cursor-pointer text-sm font-medium text-soft-gray hover:text-brand-gold">Account & Advanced</summary>
                <div className="mt-3 space-y-2">
                  <Label>Account</Label>
                  <select name="accountId" required className="h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm text-white focus-visible:outline-none focus-visible:border-brand-gold">
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field name="lotSize" label="Lot size" type="number" step="any" />
                  <Field name="riskPercent" label="Risk %" type="number" step="any" />
                </div>
              </details>

              <p className="text-xs font-semibold text-soft-gray">Trade Info</p>
              <div className="grid grid-cols-2 gap-3">
                <Field name="tradeDate" label="Date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                <Combobox name="session" label="Session" options={["Asian", "London", "New York"]} placeholder="Select session" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Combobox name="symbol" label="Instrument" options={symbols} placeholder="EURUSD, XAUUSD, NAS100..." />
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <select name="side" className="h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm text-white focus-visible:outline-none focus-visible:border-brand-gold">
                    <option>BUY</option>
                    <option>SELL</option>
                  </select>
                </div>
              </div>
              <Combobox name="strategyTag" label="Strategy / Setup" options={strategies} placeholder="Liquidity sweep, FVG, Order block..." />

              <p className="text-xs font-semibold text-soft-gray">Entry / Exit</p>
              <div className="grid grid-cols-2 gap-3">
                <Field name="entryPrice" label="Entry price" type="number" step="any" />
                <Field name="exitPrice" label="Exit price" type="number" step="any" />
              </div>

              <p className="text-xs font-semibold text-soft-gray">Risk</p>
              <div className="grid grid-cols-2 gap-3">
                <Field name="stopLoss" label="Stop loss" type="number" step="any" required={false} />
                <Field name="takeProfit" label="Take profit" type="number" step="any" required={false} />
              </div>

              <PnlCalculator />
              <p className="text-xs font-semibold text-soft-gray">Result</p>
              <Field name="profitLoss" label="Profit / loss" type="number" step="any" />
              <div className="rounded-lg bg-dark-surface p-3 text-sm">
                <p className="text-soft-gray">R-Multiple</p>
                <p className="font-medium text-white">Auto-calculated from entry, stop loss, and P/L</p>
              </div>

              <details className="rounded-lg border border-dark-surface bg-dark-charcoal p-3">
                <summary className="cursor-pointer text-sm font-medium text-soft-gray hover:text-brand-gold">Notes & Psychology</summary>
                <div className="mt-3 space-y-2">
                  <Label>Status</Label>
                  <select name="status" className="h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm text-white focus-visible:outline-none focus-visible:border-brand-gold">
                    <option value="">Auto (from P/L)</option>
                    <option>WIN</option>
                    <option>LOSS</option>
                    <option>BREAKEVEN</option>
                    <option>PENDING</option>
                  </select>
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Rating</Label>
                  <StarRating />
                </div>
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
                <div className="mt-3 space-y-2">
                  <Label>Emotions before / during</Label>
                  <TagSelector name="emotions" options={["Calm", "Anxious", "Confident", "Greedy", "Fearful", "Frustrated", "Neutral", "Excited", "Revenge", "Overtrading"]} />
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Mistakes made</Label>
                  <TagSelector name="mistakes" options={["FOMO", "Sizing too big", "No stop loss", "Moving SL", "Revenge trading", "Overtrading", "Early exit", "Late entry", "Ignoring HTF", "Not following plan"]} />
                </div>
              </details>

              <details className="rounded-lg border border-dark-surface bg-dark-charcoal p-3">
                <summary className="cursor-pointer text-sm font-medium text-soft-gray hover:text-brand-gold">Screenshots</summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <ImageUpload name="beforeScreenshot" label="Before entry" />
                  <ImageUpload name="afterScreenshot" label="After exit" />
                </div>
                <div className="mt-3">
                  <ImageUpload name="annotatedScreenshot" label="Annotated chart" />
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
              <CsvImport />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Direction</TableHead>
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
                    <TableCell className={trade.profitLoss >= 0 ? "text-right text-success-green" : "text-right text-error-red"}>{formatCurrency(trade.profitLoss)}</TableCell>
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
                    <TableCell colSpan={7} className="py-10 text-center text-soft-gray">
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

